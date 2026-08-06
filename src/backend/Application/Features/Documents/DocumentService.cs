namespace Application.Features.Documents;

using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json.Nodes;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Persistence;
using Application.Abstractions.Storage;
using Application.Abstractions.Notifications;
using Application.Contracts.Documents;
using Application.Contracts.Geo;
using Application.DTOs.Documents;
using Application.DTOs.Projects;
using Application.Documents.Extractions;
using Application.Common.Security;
using Domain.Entities;
using Domain.Enums;

public class DocumentService : IDocumentService
{
    private readonly IDocumentoRepository _documentoRepository;
    private readonly IProyectoRepository _proyectoRepository;
    private readonly IUsuarioRepository _usuarioRepository;
    private readonly IBlobStorageService _blobStorageService;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Application.Abstractions.DocumentIntelligence.IDocumentValidationService _documentValidationService;
    private readonly Application.Abstractions.Persistence.IValidacionRepository _validacionRepository;
    private readonly Application.Abstractions.Persistence.IAuditoriaRepository _auditoriaRepository;
    private readonly Application.Abstractions.Ocr.IOcrProvider _ocrProvider;
    private readonly Application.Services.DocumentProcessing.IDocumentStateEngine _documentStateEngine;
    private readonly IGeoResolutionService _geoResolutionService;
    private readonly INotificationFactory _notificationFactory;
    private readonly INotificacionRepository _notificacionRepository;

    public DocumentService(
        IDocumentoRepository documentoRepository,
        IProyectoRepository proyectoRepository,
        IUsuarioRepository usuarioRepository,
        IBlobStorageService blobStorageService,
        IUnitOfWork unitOfWork,
        Application.Abstractions.DocumentIntelligence.IDocumentValidationService documentValidationService,
        Application.Abstractions.Persistence.IValidacionRepository validacionRepository,
        Application.Abstractions.Persistence.IAuditoriaRepository auditoriaRepository,
        Application.Abstractions.Ocr.IOcrProvider ocrProvider,
        Application.Services.DocumentProcessing.IDocumentStateEngine documentStateEngine,
        IGeoResolutionService geoResolutionService,
        INotificationFactory notificationFactory,
        INotificacionRepository notificacionRepository)
    {
        _documentoRepository = documentoRepository;
        _proyectoRepository = proyectoRepository;
        _usuarioRepository = usuarioRepository;
        _blobStorageService = blobStorageService;
        _unitOfWork = unitOfWork;
        _documentValidationService = documentValidationService;
        _validacionRepository = validacionRepository;
        _auditoriaRepository = auditoriaRepository;
        _ocrProvider = ocrProvider;
        _documentStateEngine = documentStateEngine;
        _geoResolutionService = geoResolutionService;
        _notificationFactory = notificationFactory;
        _notificacionRepository = notificacionRepository;
    }

    public async Task<DocumentDto> UploadDocumentAsync(Guid projectId, UploadDocumentDto dto, Stream fileStream, string fileName, string contentType, long length, CancellationToken cancellationToken = default)
    {
        var project = await _proyectoRepository.GetByIdAsync(projectId, cancellationToken);
        if (project == null)
            throw new KeyNotFoundException($"Proyecto con ID {projectId} no encontrado.");

        if (!FileSignatureValidator.IsValidFileSignature(fileName, fileStream))
        {
            throw new ArgumentException("El archivo proporcionado no tiene una firma válida o su formato no es soportado.");
        }

        var usuario = await _usuarioRepository.GetByIdWithPlanAsync(dto.UsuarioCargaId, cancellationToken);
        if (usuario == null)
            throw new KeyNotFoundException($"Usuario con ID {dto.UsuarioCargaId} no encontrado.");

        var totalStorageUsed = await _documentoRepository.GetTotalStorageBytesByUsuarioAsync(dto.UsuarioCargaId, cancellationToken);
        
        if (!Domain.Policies.SubscriptionTierPolicy.CanStoreDocument(usuario, totalStorageUsed, length))
        {
            throw new Application.Common.Exceptions.QuotaExceededException(
                Domain.Policies.SubscriptionTierPolicy.GetTierName(usuario), 
                "MaxAlmacenamientoMb", 
                "Límite de almacenamiento alcanzado para su plan de suscripción actual.");
        }

        // Validate document integrity (RS7, RS8)
        var validationResult = await _documentValidationService.ValidateDocumentAsync(fileStream, contentType, fileName, cancellationToken);
        
        if (!validationResult.IsValid)
        {
            var missingFieldsStr = string.Join(", ", validationResult.MissingFields);
            
            // RS9: Registrar resultado de validación de integridad
            var failedValidacion = new Validacion(projectId, "IntegridadDocumental", null);
            failedValidacion.CompleteValidation(
                false, 
                $"Falta: {missingFieldsStr}",
                validationResult.ValidatedFieldsJson
            );
            await _validacionRepository.AddAsync(failedValidacion, cancellationToken);

            // RS8: Registrar el intento de carga fallido en auditoría
            var auditoria = new Auditoria(
                dto.UsuarioCargaId,
                "Intento de carga fallido",
                "UploadDocument",
                "Documento",
                null,
                projectId,
                $"Rechazado por validación de integridad. Faltan campos: {missingFieldsStr}"
            );
            await _auditoriaRepository.AddAsync(auditoria, cancellationToken);
            
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            throw new ArgumentException($"Falta: {missingFieldsStr}");
        }

        // Reset stream position after validation
        fileStream.Position = 0;

        // Compute SHA-256 Hash
        using var sha256 = System.Security.Cryptography.SHA256.Create();
        var hashBytes = await sha256.ComputeHashAsync(fileStream, cancellationToken);
        var hashString = BitConverter.ToString(hashBytes).Replace("-", "").ToLowerInvariant();

        // Reset stream position before upload
        fileStream.Position = 0;

        var extension = Path.GetExtension(fileName);
        var blobName = $"{projectId}/{Guid.NewGuid()}{extension}";
        
        var uploadResult = await _blobStorageService.UploadAsync(fileStream, blobName, contentType, cancellationToken);
        var blobUrl = uploadResult.Url;
        // Calculate version (simple approach: count existing documents of same type)
        var existingDocs = await _documentoRepository.GetByProyectoIdAsync(projectId, cancellationToken);
        var version = existingDocs.Count(d => d.TipoDocumento == dto.TipoDocumento) + 1;

        var document = new Documento(
            projectId,
            dto.TipoDocumento,
            fileName,
            blobName,
            blobUrl,
            contentType,
            extension,
            length,
            dto.UsuarioCargaId,
            version,
            dto.FechaEmision,
            dto.InstitucionEmisora,
            dto.Observaciones
        );

        document.SetHash(hashString);
        await _documentoRepository.AddAsync(document, cancellationToken);

        // ponytail: los documentos (incluso imágenes) jamás se asignan como portada del proyecto;
        // la portada solo se define mediante el flujo explícito de fotos del proyecto.
        // (Se eliminó el bloque que llamaba a project.SetImagenUrl en uploads de tipo image/)

        // RS9: Registrar resultado de validación de integridad (exitoso)
        var validacion = new Validacion(projectId, "IntegridadDocumental", document.Id);
        validacion.CompleteValidation(
            true, 
            "Validación de integridad exitosa",
            validationResult.ValidatedFieldsJson
        );
        await _validacionRepository.AddAsync(validacion, cancellationToken);

        // Auto-promote CREADO/EDITADO → REVISION once the expediente has documents
        await PromoteToRevisionIfEligibleAsync(project, existingDocs.Count() + 1, cancellationToken);

        // OCR Processing (Simulated background/sync)
        document.UpdateStatus(DocumentStatus.Processing);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

try
            {
                // Reset stream position for OCR
                fileStream.Position = 0;
                var ocrResult = await _ocrProvider.ProcessDocumentAsync(fileStream, fileName, cancellationToken);
                _documentStateEngine.ApplyOcrResult(document, ocrResult);

                // Geographic resolution for documents with Provincia + Municipio fields
                // (CertificadoTitulo, EstadoJuridico, PlanoMensuraCatastral).
                if (document.TipoDocumento == DocumentType.CertificadoTitulo
                    || document.TipoDocumento == DocumentType.CertificacionEstadoJuridico
                    || document.TipoDocumento == DocumentType.PlanoMensuraCatastral)
                {
                    await ApplyGeographicResolutionAsync(document, cancellationToken);
                }
            }
        catch (Exception ocrEx)
        {
            // OCR failure must not abort an already-persisted upload.
            // Mark as Observado so validators can review it manually.
            var fallbackJson = $"{{\"error\": \"OCR processing failed: {ocrEx.Message.Replace("\"", "'")}\", \"success\": false}}";
            document.SetOcrResult(fallbackJson, DocumentStatus.Observado);
        }
        
        _documentoRepository.Update(document);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var notif = await _notificationFactory.CreateAsync(usuario.Id,
            TipoNotificacionId.DocumentoSubido,
            $"Documento \"{document.TipoDocumento}\" subido al proyecto \"{project.Nombre}\".",
            $"/admin/projects/{projectId}/documents",
            project.Id, "Proyecto", cancellationToken);
        await _notificacionRepository.AddAsync(notif, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToDto(document);
    }

    private async Task PromoteToRevisionIfEligibleAsync(Proyecto project, int documentCount, CancellationToken cancellationToken)
    {
        if (!Domain.Policies.ProjectLifecyclePolicy.ShouldEnterReview(project.Estado?.CodigoUnico, documentCount))
            return;

        var estadoRevision = await _proyectoRepository.GetEstadoByStatusAsync(ProjectStatus.Revision, cancellationToken);
        if (estadoRevision == null)
            return;

        var oldEstadoId = project.EstadoId;
        var oldStatus = project.Estado?.CodigoUnico;
        project.UpdateEstado(estadoRevision);
        _proyectoRepository.Update(project);

        await _auditoriaRepository.AddAsync(new Auditoria(
            project.UsuarioCreadorId,
            TipoOperacion.CambioEstado,
            "CambioEstado",
            $"{oldStatus} → {ProjectStatus.Revision.ToCodigoUnico()}",
            project.Id,
            null,
            null,
            oldEstadoId,
            estadoRevision.Id
        ), cancellationToken);
    }

    public async Task<IEnumerable<DocumentDto>> GetProjectDocumentsAsync(Guid projectId, CancellationToken cancellationToken = default)
    {
        var documents = await _documentoRepository.GetByProyectoIdAsync(projectId, cancellationToken);
        return documents.Select(MapToDto);
    }

    public async Task<(Stream Stream, string ContentType, string FileName)> DownloadDocumentAsync(Guid documentId, CancellationToken cancellationToken = default)
    {
        var document = await _documentoRepository.GetByIdAsync(documentId, cancellationToken);
        if (document == null)
            throw new KeyNotFoundException($"Documento con ID {documentId} no encontrado.");

        var (stream, contentType) = await _blobStorageService.DownloadAsync(document.NombreArchivoAlmacenado, cancellationToken);
        return (stream, document.ContentType, document.NombreArchivoOriginal);
    }

    public async Task<DocumentDto> UpdateDocumentStatusAsync(Guid documentId, UpdateDocumentStatusDto dto, CancellationToken cancellationToken = default)
    {
        var document = await _documentoRepository.GetByIdAsync(documentId, cancellationToken);
        if (document == null)
            throw new KeyNotFoundException($"Documento con ID {documentId} no encontrado.");

        if (dto.EstadoDocumento.HasValue)
        {
            document.UpdateStatus(dto.EstadoDocumento.Value, dto.Observaciones);
        }

        if (dto.Activo.HasValue)
        {
            document.ToggleActive(dto.Activo.Value);
        }

        _documentoRepository.Update(document);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToDto(document);
    }

    public async Task<DocumentDto> UpdateDocumentTypeAsync(Guid documentId, UpdateDocumentTypeDto dto, CancellationToken cancellationToken = default)
    {
        var document = await _documentoRepository.GetByIdAsync(documentId, cancellationToken);
        if (document == null)
            throw new KeyNotFoundException($"Documento con ID {documentId} no encontrado.");

        document.UpdateType(dto.TipoDocumento);

        // ponytail: re-apply OCR rules if raw OCR already exists to populate the new type's fields
        if (!string.IsNullOrEmpty(document.ResultadoOcrJson))
        {
            try
            {
                var options = new System.Text.Json.JsonSerializerOptions { PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase };
                var ocrResult = System.Text.Json.JsonSerializer.Deserialize<Application.Abstractions.Ocr.OcrResult>(document.ResultadoOcrJson, options);
                if (ocrResult != null)
                {
                    document.UpdateStatus(DocumentStatus.Processing);
                    _documentStateEngine.ApplyOcrResult(document, ocrResult);

                    // Re-apply geographic resolution for documents with Provincia + Municipio fields
                    if (document.TipoDocumento == DocumentType.CertificadoTitulo
                        || document.TipoDocumento == DocumentType.CertificacionEstadoJuridico
                        || document.TipoDocumento == DocumentType.PlanoMensuraCatastral)
                    {
                        await ApplyGeographicResolutionAsync(document, cancellationToken);
                    }
                }
            }
            catch
            {
                // Ignore parsing errors, continue with just the type update
            }
        }

        _documentoRepository.Update(document);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToDto(document);
    }

    public async Task<IEnumerable<RequiredDocumentDto>> GetRequiredDocumentsAsync(Guid projectId, CancellationToken cancellationToken = default)
    {
        var project = await _proyectoRepository.GetByIdAsync(projectId, cancellationToken);
        if (project == null)
            throw new KeyNotFoundException($"Proyecto con ID {projectId} no encontrado.");

        var requiredTypes = Domain.Policies.RequiredDocumentsPolicy.GetRequiredDocumentsForCategory(project.CategoriaId);
        
        return requiredTypes.Select(type => new RequiredDocumentDto(
            type,
            type.ToString(), // Or a better mapping to friendly names
            $"Documento requerido para categoría {project.CategoriaId}",
            project.CategoriaId
        ));
    }

    public async Task<ProjectDiagnosticDto> GetProjectDiagnosticAsync(Guid projectId, CancellationToken cancellationToken = default)
    {
        var project = await _proyectoRepository.GetByIdAsync(projectId, cancellationToken);
        if (project == null)
            throw new KeyNotFoundException($"Proyecto con ID {projectId} no encontrado.");

        var requiredTypes = Domain.Policies.RequiredDocumentsPolicy.GetRequiredDocumentsForCategory(project.CategoriaId).ToList();
        var uploadedDocs = await _documentoRepository.GetByProyectoIdAsync(projectId, cancellationToken);

        var diagnostics = new List<DocumentDiagnosticDto>();
        int presentCount = 0;

        foreach (var type in requiredTypes)
        {
            var docsOfType = uploadedDocs.Where(d => d.TipoDocumento == type && d.Activo).ToList();
            string status = "Ausente";

            if (docsOfType.Any())
            {
                if (docsOfType.Any(d => d.EstadoDocumento == DocumentStatus.Valid))
                {
                    status = "Presente";
                    presentCount++;
                }
                else if (docsOfType.Any(d => d.EstadoDocumento == DocumentStatus.Invalid))
                {
                    status = "Incompleto";
                }
                else
                {
                    status = "Presente"; // Pending verification, but present
                    presentCount++;
                }
            }

            diagnostics.Add(new DocumentDiagnosticDto(
                type,
                type.ToString(),
                status
            ));
        }

        double percentage = requiredTypes.Any() ? (double)presentCount / requiredTypes.Count * 100 : 0;
        string generalStatus = percentage == 100 ? "Completo" : "Incompleto";

        return new ProjectDiagnosticDto(
            Math.Round(percentage, 2),
            generalStatus,
            diagnostics
        );
    }

    public async Task<DocumentDto> UpdateDocumentFieldReviewAsync(Guid documentId, string fieldName, UpdateDocumentFieldReviewDto dto, CancellationToken cancellationToken = default)
    {
        var document = await _documentoRepository.GetByIdAsync(documentId, cancellationToken);
        if (document == null)
            throw new KeyNotFoundException($"Documento con ID {documentId} no encontrado.");

        if (string.IsNullOrWhiteSpace(document.ResultadoOcrJson))
            throw new InvalidOperationException("El documento no tiene resultados OCR para revisar.");

        var ocrResult = System.Text.Json.JsonSerializer.Deserialize<Application.Abstractions.Ocr.OcrResult>(document.ResultadoOcrJson, new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        if (ocrResult == null)
            throw new InvalidOperationException("No se pudo parsear el resultado OCR.");

        bool updated = false;

        // 1. Update in CanonicalDataJson if present
        if (!string.IsNullOrEmpty(ocrResult.CanonicalDataJson))
        {
            try
            {
                var jObject = System.Text.Json.Nodes.JsonNode.Parse(ocrResult.CanonicalDataJson);
                if (jObject != null && jObject["payload"] != null)
                {
                    var payload = jObject["payload"];
                    var payloadObj = payload?.AsObject();
                    if (payloadObj != null)
                    {
                        var matchingKey = payloadObj.Select(p => p.Key).FirstOrDefault(k => string.Equals(k, fieldName, StringComparison.OrdinalIgnoreCase));
                        
                        if (matchingKey != null && payloadObj[matchingKey] != null)
                        {
                            var fieldObj = payloadObj[matchingKey];
                            if (fieldObj != null)
                            {
                                fieldObj["status"] = (int)dto.ReviewState;
                                if (dto.CorrectedValue != null)
                                {
                                    fieldObj["normalizedValue"] = dto.CorrectedValue;
                                }
                                ocrResult.CanonicalDataJson = jObject.ToJsonString();
                                updated = true;
                            }
                        }
                    }
                }
            }
            catch
            {
                // Ignore canonical JSON parsing errors
            }
        }

        // 2. Update in Fields dict
        var actualKey = ocrResult.Fields.Keys.FirstOrDefault(k => string.Equals(k, fieldName, StringComparison.OrdinalIgnoreCase));
        if (actualKey != null)
        {
            var field = ocrResult.Fields[actualKey];
            var updatedField = field with { ReviewState = dto.ReviewState, CorrectedValue = dto.CorrectedValue };
            ocrResult.Fields[actualKey] = updatedField;
            updated = true;
        }
        else if (updated)
        {
            // If it was found in CanonicalDataJson but not in Fields, add it to Fields so it syncs up
            ocrResult.Fields[fieldName] = new Application.Abstractions.Ocr.OcrField {
                Name = fieldName,
                Value = dto.CorrectedValue ?? "",
                Confidence = 1.0,
                ReviewState = dto.ReviewState,
                CorrectedValue = dto.CorrectedValue
            };
        }

        if (!updated)
            throw new KeyNotFoundException($"Campo {fieldName} no encontrado en el resultado OCR.");

        var updatedJson = System.Text.Json.JsonSerializer.Serialize(ocrResult, new System.Text.Json.JsonSerializerOptions { PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase });
        document.UpdateOcrResult(updatedJson);

        _documentoRepository.Update(document);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToDto(document);
    }

    private static DocumentDto MapToDto(Documento d) => new(
        d.Id,
        d.ProyectoId,
        d.TipoDocumento,
        d.NombreArchivoOriginal,
        d.ContentType,
        d.Extension,
        d.TamanoBytes,
        d.EstadoDocumento,
        d.Activo,
        d.Version,
        d.FechaEmision,
        d.InstitucionEmisora,
        d.UsuarioCargaId,
        d.Observaciones,
        d.RutaArchivo,
        d.CreatedAtUtc,
        d.UpdatedAtUtc,
        d.ResultadoOcrJson
    );

    private async Task ApplyGeographicResolutionAsync(Documento document, CancellationToken ct)
    {
        try
        {
            // Deserialize the current OCR result as the FULL OcrResult (not just the extraction record).
            // Previously this method deserialized ResultadoOcrJson directly as CertificadoTituloRdExtractionV1,
            // which silently produced an all-default extraction (System.Text.Json ignores unknown properties)
            // and overwrote ResultadoOcrJson with just the extraction, losing OCR text/lines/rawJson forever.
            var ocrJson = document.ResultadoOcrJson;
            if (string.IsNullOrWhiteSpace(ocrJson)) return;

            var options = new System.Text.Json.JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true,
                PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase
            };

            var ocrResult = System.Text.Json.JsonSerializer.Deserialize<Application.Abstractions.Ocr.OcrResult>(ocrJson, options);
            if (ocrResult == null) return;

            if (string.IsNullOrEmpty(ocrResult.CanonicalDataJson)) return;

            // Read the canonical envelope as a generic JSON tree so we never collapse
            // the payload to the wrong extraction record type. This method is called
            // for CertificadoTitulo, EstadoJuridico AND PlanoMensuraCatastral; each
            // type has a different extraction schema, and we must preserve the original
            // shape of the payload verbatim.
            JsonNode? envelope;
            try
            {
                envelope = JsonNode.Parse(ocrResult.CanonicalDataJson);
            }
            catch
            {
                return;
            }
            if (envelope == null) return;

            var payload = envelope["payload"] as JsonObject;
            if (payload == null) return;

            // Resolve Provincia (if payload has a "provincia" ExtractedField)
            var provinciaNode = payload["provincia"] as JsonObject;
            var provinciaRawValue = provinciaNode?["rawValue"]?.GetValue<string>();
            var provinceResolution = !string.IsNullOrWhiteSpace(provinciaRawValue)
                ? await _geoResolutionService.ResolveProvinciaAsync(provinciaRawValue, ct)
                : null;

            // Full-text fallback: when per-field rawValue is empty (e.g. PDFs without
            // explicit "PROVINCIA:" label), scan the entire OCR text for any province-like
            // substring. PDFs like PLANO 505483687149 have "AAALTAGRACIA" (corrupted
            // "LA ALTAGRACIA") with no label - the matcher will resolve via Jaro-Winkler.
            if (provinceResolution == null || provinceResolution.ResolvedId == null)
            {
                if (!string.IsNullOrWhiteSpace(ocrResult.ExtractedText))
                {
                    var textFallback = await _geoResolutionService.ResolveProvinciaFromTextAsync(
                        ocrResult.ExtractedText, ct);
                    if (textFallback.ResolvedId != null)
                        provinceResolution = textFallback;
                }
            }

            if (provinceResolution != null)
            {
                payload["provinceResolution"] = JsonNode.Parse(System.Text.Json.JsonSerializer.Serialize(provinceResolution, options));

                // Resolve Municipio (scoped to resolved province if available)
                var municipioNode = payload["municipio"] as JsonObject;
                var municipioRawValue = municipioNode?["rawValue"]?.GetValue<string>();
                var provinciaId = provinceResolution.ResolvedId;

                var municipalityResolution = !string.IsNullOrWhiteSpace(municipioRawValue)
                    ? await _geoResolutionService.ResolveMunicipioAsync(municipioRawValue, provinciaId, ct)
                    : null;

                // Full-text fallback for municipio too.
                if ((municipalityResolution == null || municipalityResolution.ResolvedId == null)
                    && !string.IsNullOrWhiteSpace(ocrResult.ExtractedText))
                {
                    var muniFallback = await _geoResolutionService.ResolveMunicipioFromTextAsync(
                        ocrResult.ExtractedText, provinciaId, ct);
                    if (muniFallback.ResolvedId != null)
                        municipalityResolution = muniFallback;
                }

                if (municipalityResolution != null)
                    payload["municipalityResolution"] = JsonNode.Parse(System.Text.Json.JsonSerializer.Serialize(municipalityResolution, options));
            }

            ocrResult.CanonicalDataJson = envelope.ToJsonString(options);

            // Serialize the FULL OcrResult back so the controller can still recover extractedText / lines
            // and re-run the mapper if needed.
            var updatedJson = System.Text.Json.JsonSerializer.Serialize(ocrResult, options);

            document.SetOcrResult(updatedJson, document.EstadoDocumento);
        }
        catch
        {
            // Geographic resolution failure must not abort document upload
            // Log and continue with original OCR result
        }
    }
    public async Task DeleteDocumentAsync(Guid documentId, CancellationToken cancellationToken = default)
    {
        var document = await _documentoRepository.GetByIdAsync(documentId, cancellationToken);
        if (document == null)
            throw new KeyNotFoundException($"Documento con ID {documentId} no encontrado.");

        try
        {
            await _blobStorageService.DeleteAsync(document.RutaArchivo, cancellationToken);
        }
        catch (Exception)
        {
            // Ignore storage deletion errors to allow DB deletion to proceed
        }

        // Entity Framework Core will automatically delete the Hallazgos associated with this document
        // if the relationship is configured with Cascade Delete.
        _documentoRepository.Delete(document);

        // Actualizar estado del proyecto si es necesario
        var project = await _proyectoRepository.GetByIdAsync(document.ProyectoId, cancellationToken);
        if (project != null)
        {
            // Aquí podríamos llamar a GobernanzaDeDatosService para reevaluar el estado del proyecto
            // o simplemente guardarlo.
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
