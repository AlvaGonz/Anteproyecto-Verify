#if DEBUG
using Application.Abstractions.Notifications;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

public class EmailTestRequest
{
    public string? Email { get; set; }
    public string? Name { get; set; }
}

/// <summary>
/// Controller temporal para smoke testing de la integración Resend.
/// Solo disponible en ambiente Development/Debug.
/// ELIMINAR antes de producción.
/// </summary>
[ApiController]
[Route("api/email-test")]
[ApiExplorerSettings(GroupName = "dev-only")]
public class EmailTestController : ControllerBase
{
    private readonly IEmailService _emailService;
    private readonly ILogger<EmailTestController> _logger;
    private const string TestEmail = "adrian.aalvarezgonz@hotmail.com";

    public EmailTestController(IEmailService emailService, ILogger<EmailTestController> logger)
    {
        _emailService = emailService;
        _logger = logger;
    }

    /// <summary>UC-01: Verificación de cuenta nueva</summary>
    [HttpPost("uc-01-account-verification")]
    public async Task<IActionResult> TestAccountVerification([FromBody] EmailTestRequest? request)
    {
        // Normalize to lowercase: Resend sandbox is case-sensitive and only accepts
        // the exact lowercase email that owns the API token.
        string recipient = (request?.Email ?? TestEmail).ToLowerInvariant();
        string name = request?.Name ?? "Adrian Alvarez";
        _logger.LogInformation("[EmailTest] Disparando UC-01: AccountVerification → {Email}", recipient);
        try
        {
            await _emailService.SendAccountVerificationAsync(
                toEmail: recipient,
                userName: name,
                verificationToken: "mock-token-abc123xyz"
            );
            return Ok(new { useCase = "UC-01", status = "sent", to = recipient, template = "AccountVerification" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[EmailTest] UC-01 FAILED");
            return StatusCode(500, new { useCase = "UC-01", error = ex.Message });
        }
    }

    /// <summary>UC-02: Confirmación de documento cargado</summary>
    [HttpPost("uc-02-document-upload")]
    public async Task<IActionResult> TestDocumentUpload([FromBody] EmailTestRequest? request)
    {
        string recipient = (request?.Email ?? TestEmail).ToLowerInvariant();
        string name = request?.Name ?? "Adrian Alvarez";
        _logger.LogInformation("[EmailTest] Disparando UC-02: DocumentUpload → {Email}", recipient);
        try
        {
            await _emailService.SendDocumentUploadConfirmationAsync(
                toEmail: recipient,
                userName: name,
                projectName: "Finca Los Álamos — proj-001",
                documentType: "Título de Propiedad"
            );
            return Ok(new { useCase = "UC-02", status = "sent", to = recipient, template = "DocumentUploadConfirmation" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[EmailTest] UC-02 FAILED");
            return StatusCode(500, new { useCase = "UC-02", error = ex.Message });
        }
    }

    /// <summary>UC-03a: Documento verificado (aprobado)</summary>
    [HttpPost("uc-03a-document-approved")]
    public async Task<IActionResult> TestDocumentApproved([FromBody] EmailTestRequest? request)
    {
        string recipient = (request?.Email ?? TestEmail).ToLowerInvariant();
        string name = request?.Name ?? "Adrian Alvarez";
        _logger.LogInformation("[EmailTest] Disparando UC-03a: DocumentApproved → {Email}", recipient);
        try
        {
            await _emailService.SendDocumentStatusUpdateAsync(
                toEmail: recipient,
                userName: name,
                projectName: "Finca Los Álamos — proj-001",
                documentType: "Estado Jurídico",
                status: "verificado",
                rejectionReason: null
            );
            return Ok(new { useCase = "UC-03a", status = "sent", to = recipient, template = "DocumentStatusUpdate/approved" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[EmailTest] UC-03a FAILED");
            return StatusCode(500, new { useCase = "UC-03a", error = ex.Message });
        }
    }

    /// <summary>UC-03b: Documento rechazado (con motivo)</summary>
    [HttpPost("uc-03b-document-rejected")]
    public async Task<IActionResult> TestDocumentRejected([FromBody] EmailTestRequest? request)
    {
        string recipient = (request?.Email ?? TestEmail).ToLowerInvariant();
        string name = request?.Name ?? "Adrian Alvarez";
        _logger.LogInformation("[EmailTest] Disparando UC-03b: DocumentRejected → {Email}", recipient);
        try
        {
            await _emailService.SendDocumentStatusUpdateAsync(
                toEmail: recipient,
                userName: name,
                projectName: "Finca Los Álamos — proj-001",
                documentType: "Mensura Catastral",
                status: "rechazado",
                rejectionReason: "El documento está incompleto — falta la firma del notario."
            );
            return Ok(new { useCase = "UC-03b", status = "sent", to = recipient, template = "DocumentStatusUpdate/rejected" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[EmailTest] UC-03b FAILED");
            return StatusCode(500, new { useCase = "UC-03b", error = ex.Message });
        }
    }

    /// <summary>UC-04: Proyecto creado</summary>
    [HttpPost("uc-04-project-created")]
    public async Task<IActionResult> TestProjectCreated([FromBody] EmailTestRequest? request)
    {
        string recipient = (request?.Email ?? TestEmail).ToLowerInvariant();
        string name = request?.Name ?? "Adrian Alvarez";
        _logger.LogInformation("[EmailTest] Disparando UC-04: ProjectCreated → {Email}", recipient);
        try
        {
            await _emailService.SendProjectCreatedAsync(
                toEmail: recipient,
                ownerName: name,
                projectName: "Finca Los Álamos",
                projectId: "proj-001"
            );
            return Ok(new { useCase = "UC-04", status = "sent", to = recipient, template = "ProjectCreated" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[EmailTest] UC-04 FAILED");
            return StatusCode(500, new { useCase = "UC-04", error = ex.Message });
        }
    }
}
#endif
