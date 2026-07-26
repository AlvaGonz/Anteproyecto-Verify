namespace Api.Controllers;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Contracts.Documents;
using Application.DTOs.Documents;
using Application.Features.Documents.GetDocumentDiagnosis;
using Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/projects/{projectId}/documents")]
[Authorize]
public class ProjectDocumentsController : ControllerBase
{
    private readonly IDocumentService _documentService;
    private readonly GetDocumentDiagnosisQueryHandler _diagnosisHandler;
    private readonly IConfiguration _configuration;

    public ProjectDocumentsController(
        IDocumentService documentService,
        GetDocumentDiagnosisQueryHandler diagnosisHandler,
        IConfiguration configuration)
    {
        _documentService = documentService;
        _diagnosisHandler = diagnosisHandler;
        _configuration = configuration;
    }

    private Guid GetCurrentUserId()
    {
        // Try to get user ID from JWT claims
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                       ?? User.FindFirst("sub")?.Value;
        
        if (Guid.TryParse(userIdClaim, out var userId) && userId != Guid.Empty)
        {
            return userId;
        }

        // Development fallback: use a known test user ID
        // This allows Playwright tests with mocked auth to work against real backend
        var isDevelopment = _configuration.GetValue<bool>("UseMockData") 
                         || Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development";
        
        if (isDevelopment)
        {
            // Known test user GUID seeded in AppDbContextSeeder
            return Guid.Parse("11111111-1111-1111-1111-111111111111");
        }

        return Guid.Empty;
    }

    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<ValidationDocumentDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetProjectDocuments(Guid projectId)
    {
        var documents = await _documentService.GetProjectDocumentsAsync(projectId);
        var safeDocs = documents.Select(MapToValidationDto);
        return Ok(safeDocs);
    }

    [HttpPost]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(typeof(ValidationDocumentDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UploadDocument(
        Guid projectId,
        [FromForm] DocumentType tipoDocumento,
        [FromForm] DateTime? fechaEmision,
        [FromForm] string? institucionEmisora,
        [FromForm] string? observaciones,
        IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest("El archivo es requerido y no puede estar vacío.");

        // Basic validation (can be moved to a validator or options pattern)
        var allowedExtensions = new[] { ".pdf", ".jpg", ".jpeg", ".png", ".webp" };
        var extension = System.IO.Path.GetExtension(file.FileName).ToLowerInvariant();
        if (Array.IndexOf(allowedExtensions, extension) < 0)
            return BadRequest("Tipo de archivo no permitido.");

        if (file.Length > 10 * 1024 * 1024) // 10MB limit
            return BadRequest("El archivo excede el tamaño máximo permitido (10MB).");

        var userId = GetCurrentUserId();
        if (userId == Guid.Empty)
            return Unauthorized("Usuario no autenticado.");

        var dto = new UploadDocumentDto(
            tipoDocumento,
            userId,
            fechaEmision,
            institucionEmisora,
            observaciones
        );

        using var stream = file.OpenReadStream();
        try
        {
            var document = await _documentService.UploadDocumentAsync(
                projectId,
                dto,
                stream,
                file.FileName,
                file.ContentType,
                file.Length
            );

            return CreatedAtAction(nameof(GetProjectDocuments), new { projectId }, MapToValidationDto(document));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [HttpPost("/api/v1/projects/{projectId}/documents/requirements/{requirementCode}/upload")]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(typeof(ValidationDocumentDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UploadRequirementDocument(
        Guid projectId,
        string requirementCode,
        [FromForm] IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest("El archivo es requerido y no puede estar vacío.");

        // Validaciones básicas de archivo (reutilizando la lógica existente)
        var allowedExtensions = new[] { ".pdf", ".jpg", ".jpeg", ".png", ".webp" };
        var extension = System.IO.Path.GetExtension(file.FileName).ToLowerInvariant();
        if (Array.IndexOf(allowedExtensions, extension) < 0)
            return BadRequest("Tipo de archivo no permitido.");

        if (file.Length > 10 * 1024 * 1024) // 10MB limit
            return BadRequest("El archivo excede el tamaño máximo permitido (10MB).");

        // TODO: Mapear requirementCode a DocumentType de forma segura
        // Esto requerirá lógica adicional (por ahora usamos un default o lanzamos si es inválido)
        DocumentType tipoDocumento;
        if (!Enum.TryParse<DocumentType>(requirementCode, true, out tipoDocumento))
        {
            // Mapeo básico manual según requirementCode esperado
            switch (requirementCode.ToUpperInvariant())
            {
                case "TITULO":
                    tipoDocumento = DocumentType.CertificadoTitulo;
                    break;
                case "ESTADO_JURIDICO":
                    tipoDocumento = DocumentType.CertificacionEstadoJuridico;
                    break;
                case "MENSURA":
                case "PLANO_MENSURA":
                    tipoDocumento = DocumentType.PlanoMensuraCatastral;
                    break;
                case "CEDULA":
                    tipoDocumento = DocumentType.ID;
                    break;
                case "PODER":
                    tipoDocumento = DocumentType.PoderNotarial;
                    break;
                case "IPI":
                case "CERTIFICACION_IPI":
                    tipoDocumento = DocumentType.CertificacionIPI;
                    break;

                case "RNC":
                    tipoDocumento = DocumentType.RNC;
                    break;
                default:
                    return BadRequest($"Código de requerimiento no soportado: {requirementCode}");
            }
        }

        var userId = GetCurrentUserId();
        if (userId == Guid.Empty)
            return Unauthorized("Usuario no autenticado.");

        var dto = new UploadDocumentDto(
            tipoDocumento,
            userId,
            DateTime.UtcNow, // Fecha de emisión default u opcional
            null,
            null
        );

        using var stream = file.OpenReadStream();
        try
        {
            var document = await _documentService.UploadDocumentAsync(
                projectId,
                dto,
                stream,
                file.FileName,
                file.ContentType,
                file.Length
            );

            // Devolver Created, con ubicación a la lista o descarga
            return Created($"/api/projects/{projectId}/documents/{document.Id}/download", MapToValidationDto(document));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (Application.Common.Exceptions.QuotaExceededException ex)
        {
            return StatusCode(StatusCodes.Status402PaymentRequired, new { error = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { error = "Error al procesar el documento. Por favor intente de nuevo.", detail = ex.Message });
        }
    }

    [HttpGet("{documentId}/download")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DownloadDocument(Guid projectId, Guid documentId)
    {
        try
        {
            var (stream, contentType, fileName) = await _documentService.DownloadDocumentAsync(documentId);
            return File(stream, contentType, fileName);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [HttpPatch("{documentId}/status")]
    [ProducesResponseType(typeof(ValidationDocumentDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateDocumentStatus(Guid projectId, Guid documentId, [FromBody] UpdateDocumentStatusDto dto)
    {
        try
        {
            var document = await _documentService.UpdateDocumentStatusAsync(documentId, dto);
            return Ok(MapToValidationDto(document));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [HttpPatch("{documentId}/type")]
    [ProducesResponseType(typeof(ValidationDocumentDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateDocumentType(Guid projectId, Guid documentId, [FromBody] UpdateDocumentTypeDto dto)
    {
        try
        {
            var document = await _documentService.UpdateDocumentTypeAsync(documentId, dto);
            return Ok(MapToValidationDto(document));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [HttpPatch("{documentId}/fields/{fieldName}")]
    [ProducesResponseType(typeof(ValidationDocumentDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UpdateDocumentFieldReview(Guid projectId, Guid documentId, string fieldName, [FromBody] UpdateDocumentFieldReviewDto dto)
    {
        try
        {
            var document = await _documentService.UpdateDocumentFieldReviewAsync(documentId, fieldName, dto);
            return Ok(MapToValidationDto(document));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpGet("required-documents")]
    [ProducesResponseType(typeof(IEnumerable<RequiredDocumentDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetRequiredDocuments(Guid projectId, CancellationToken cancellationToken)
    {
        try
        {
            var documents = await _documentService.GetRequiredDocumentsAsync(projectId, cancellationToken);
            return Ok(documents);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [HttpGet("diagnostic")]
    [ProducesResponseType(typeof(Application.DTOs.Projects.ProjectDiagnosticDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetProjectDiagnostic(Guid projectId, CancellationToken cancellationToken)
    {
        try
        {
            var diagnostic = await _documentService.GetProjectDiagnosticAsync(projectId, cancellationToken);
            return Ok(diagnostic);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [HttpGet("diagnosis")]
    [Authorize(Roles = "DEVELOPER,VALIDATOR")]
    [ProducesResponseType(typeof(DocumentDiagnosisDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
    public async Task<IActionResult> GetDocumentDiagnosis(Guid projectId, CancellationToken cancellationToken)
    {
        try
        {
            var query = new GetDocumentDiagnosisQuery { ProjectId = projectId };
            var result = await _diagnosisHandler.HandleAsync(query, cancellationToken);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return StatusCode(StatusCodes.Status429TooManyRequests, new { error = ex.Message });
        }
        catch (FluentValidation.ValidationException ex)
        {
            return BadRequest(new { errors = ex.Errors.Select(e => e.ErrorMessage) });
        }
    }

    private ValidationDocumentDto MapToValidationDto(DocumentDto d)
    {
        Application.Documents.Extractions.CedulaRdExtractionV1? cedulaExtraction = null;
        Application.Documents.Extractions.CertificadoTituloRdExtractionV1? tituloExtraction = null;
        Application.Documents.Extractions.PlanoMensuraCatastralRdExtractionV1? mensuraExtraction = null;
        Application.Documents.Extractions.EstadoJuridicoRdExtractionV1? estadoJuridicoExtraction = null;
        Application.Documents.Extractions.CertificacionIPIRdExtractionV1? certificacionIPIExtraction = null;

        if (!string.IsNullOrEmpty(d.ResultadoOcrJson))
        {
            try
            {
                var options = new System.Text.Json.JsonSerializerOptions { PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase };
                var ocrResult = System.Text.Json.JsonSerializer.Deserialize<Application.Abstractions.Ocr.OcrResult>(d.ResultadoOcrJson, options);
                if (ocrResult != null)
                {
                    if (!string.IsNullOrEmpty(ocrResult.CanonicalDataJson))
                    {
                        using var doc = System.Text.Json.JsonDocument.Parse(ocrResult.CanonicalDataJson);
                        var root = doc.RootElement;
                        if (root.TryGetProperty("documentType", out var typeElement))
                        {
                            var docType = typeElement.GetString();
                            var payloadElement = root.GetProperty("payload");
                            if (docType == "Cedula")
                            {
                                cedulaExtraction = System.Text.Json.JsonSerializer.Deserialize<Application.Documents.Extractions.CedulaRdExtractionV1>(payloadElement.GetRawText(), options);
                            }
                            else if (docType == "CertificadoTitulo")
                            {
                                tituloExtraction = System.Text.Json.JsonSerializer.Deserialize<Application.Documents.Extractions.CertificadoTituloRdExtractionV1>(payloadElement.GetRawText(), options);
                            }
                            else if (docType == "PlanoMensuraCatastral")
                            {
                                mensuraExtraction = System.Text.Json.JsonSerializer.Deserialize<Application.Documents.Extractions.PlanoMensuraCatastralRdExtractionV1>(payloadElement.GetRawText(), options);
                            }
                            else if (docType == "EstadoJuridico")
                            {
                                estadoJuridicoExtraction = System.Text.Json.JsonSerializer.Deserialize<Application.Documents.Extractions.EstadoJuridicoRdExtractionV1>(payloadElement.GetRawText(), options);
                            }
                            else if (docType == "CertificacionIPI")
                            {
                                certificacionIPIExtraction = System.Text.Json.JsonSerializer.Deserialize<Application.Documents.Extractions.CertificacionIPIRdExtractionV1>(payloadElement.GetRawText(), options);
                            }
                        }
                    }
                    else
                    {
                        // Fallback for older documents that didn't persist CanonicalDataJson
                        if (d.TipoDocumento == DocumentType.ID)
                        {
                            cedulaExtraction = Application.Documents.Extractions.CedulaExtractionMapper.MapFromOcrResult(ocrResult);
                        }
                        else if (d.TipoDocumento == DocumentType.CertificadoTitulo || d.TipoDocumento == DocumentType.TITLE)
                        {
                            tituloExtraction = Application.Documents.Extractions.CertificadoTituloRdPaddleMapper.MapFromOcrResult(ocrResult);
                        }
                        else if (d.TipoDocumento == DocumentType.PlanoMensuraCatastral)
                        {
                            mensuraExtraction = Application.Documents.Extractions.PlanoMensuraCatastralRdPaddleMapper.MapFromOcrResult(ocrResult);
                        }
                        else if (d.TipoDocumento == DocumentType.CertificacionEstadoJuridico)
                        {
                            estadoJuridicoExtraction = Application.Documents.Extractions.EstadoJuridicoRdPaddleMapper.MapFromOcrResult(ocrResult);
                        }
                        else if (d.TipoDocumento == DocumentType.CertificacionIPI)
                        {
                            certificacionIPIExtraction = Application.Documents.Extractions.CertificacionIPIRdPaddleMapper.MapFromOcrResult(ocrResult);
                        }
                    }
                }
            }
            catch
            {
                // Ignore serialization errors to gracefully degrade
            }
        }

        return new ValidationDocumentDto(
            d.Id, d.ProyectoId, d.TipoDocumento, d.NombreArchivoOriginal, d.ContentType, d.Extension,
            d.TamanoBytes, d.EstadoDocumento, d.Activo, d.Version, d.FechaEmision, d.InstitucionEmisora,
            d.UsuarioCargaId, d.Observaciones, d.CreatedAtUtc, d.UpdatedAtUtc, cedulaExtraction, tituloExtraction, mensuraExtraction, estadoJuridicoExtraction, certificacionIPIExtraction
        );
    }
}
