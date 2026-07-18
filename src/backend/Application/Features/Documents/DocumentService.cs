namespace Application.Features.Documents;

using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Persistence;
using Application.Abstractions.Storage;
using Application.Contracts.Documents;
using Application.DTOs.Documents;
using Application.DTOs.Projects;
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
        Application.Services.DocumentProcessing.IDocumentStateEngine documentStateEngine)
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

        if (contentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase))
        {
            if (string.IsNullOrEmpty(project.ImagenUrl))
            {
                project.SetImagenUrl(blobUrl);
                _proyectoRepository.Update(project);
            }
        }

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

        return MapToDto(document);
    }

    private async Task PromoteToRevisionIfEligibleAsync(Proyecto project, int documentCount, CancellationToken cancellationToken)
    {
        if (!Domain.Policies.ProjectLifecyclePolicy.ShouldEnterReview(project.Estado?.CodigoUnico, documentCount))
            return;

        var estadoRevision = await _proyectoRepository.GetEstadoByStatusAsync(ProjectStatus.Revision, cancellationToken);
        if (estadoRevision == null)
            return;

        project.UpdateEstado(estadoRevision);
        _proyectoRepository.Update(project);
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

        _documentoRepository.Update(document);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToDto(document);
    }

    public async Task<IEnumerable<RequiredDocumentDto>> GetRequiredDocumentsAsync(Guid projectId, CancellationToken cancellationToken = default)
    {
        var project = await _proyectoRepository.GetByIdAsync(projectId, cancellationToken);
        if (project == null)
            throw new KeyNotFoundException($"Proyecto con ID {projectId} no encontrado.");

        var requiredTypes = Domain.Policies.RequiredDocumentsPolicy.GetRequiredDocumentsForCategory(project.Categoria);
        
        return requiredTypes.Select(type => new RequiredDocumentDto(
            type,
            type.ToString(), // Or a better mapping to friendly names
            $"Documento requerido para categoría {project.Categoria}",
            project.Categoria
        ));
    }

    public async Task<ProjectDiagnosticDto> GetProjectDiagnosticAsync(Guid projectId, CancellationToken cancellationToken = default)
    {
        var project = await _proyectoRepository.GetByIdAsync(projectId, cancellationToken);
        if (project == null)
            throw new KeyNotFoundException($"Proyecto con ID {projectId} no encontrado.");

        var requiredTypes = Domain.Policies.RequiredDocumentsPolicy.GetRequiredDocumentsForCategory(project.Categoria).ToList();
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
        d.UpdatedAtUtc
    );
}
