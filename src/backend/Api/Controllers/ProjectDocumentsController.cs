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
    [ProducesResponseType(typeof(IEnumerable<DocumentDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetProjectDocuments(Guid projectId)
    {
        var documents = await _documentService.GetProjectDocumentsAsync(projectId);
        return Ok(documents);
    }

    [HttpPost]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(typeof(DocumentDto), StatusCodes.Status201Created)]
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
        var allowedExtensions = new[] { ".pdf", ".jpg", ".jpeg", ".png" };
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

            return CreatedAtAction(nameof(GetProjectDocuments), new { projectId }, document);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [HttpPost("/api/v1/projects/{projectId}/documents/requirements/{requirementCode}/upload")]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(typeof(DocumentDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UploadRequirementDocument(
        Guid projectId,
        string requirementCode,
        IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest("El archivo es requerido y no puede estar vacío.");

        // Validaciones básicas de archivo (reutilizando la lógica existente)
        var allowedExtensions = new[] { ".pdf", ".jpg", ".jpeg", ".png" };
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
            // Mapeo básico manual según requirementCode esperado (ej: TITULO -> CertificadoTitulo)
            switch (requirementCode.ToUpperInvariant())
            {
                case "TITULO":
                    tipoDocumento = DocumentType.CertificadoTitulo;
                    break;
                case "PLANO_MENSURA":
                    tipoDocumento = DocumentType.PlanoMensuraCatastral;
                    break;
                case "IPI":
                    tipoDocumento = DocumentType.CertificacionIPI;
                    break;
                case "ESTATUTOS":
                    tipoDocumento = DocumentType.ActaConstitutiva;
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
            return Created($"/api/projects/{projectId}/documents/{document.Id}/download", document);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
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
    [ProducesResponseType(typeof(DocumentDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateDocumentStatus(Guid projectId, Guid documentId, [FromBody] UpdateDocumentStatusDto dto)
    {
        try
        {
            var document = await _documentService.UpdateDocumentStatusAsync(documentId, dto);
            return Ok(document);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
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
}
