namespace Infrastructure.Email;

using System.Security.Cryptography;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Notifications;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Resend;

public class ResendEmailService : IEmailService
{
    private readonly IResend _resend;
    private readonly ILogger<ResendEmailService> _logger;
    private readonly string _fromEmail;
    private readonly string _fromName;
    private readonly bool _isTestEnvironment;

    public ResendEmailService(
        IResend resend,
        IConfiguration configuration,
        ILogger<ResendEmailService> logger)
    {
        _resend = resend;
        _logger = logger;

        var section = configuration.GetSection("Resend");
        _fromEmail = section.GetValue<string>("FromEmail") ?? "onboarding@resend.dev";
        _fromName = section.GetValue<string>("FromName") ?? "VeriFinca";

        var apiToken = section.GetValue<string>("ApiToken") ?? "re_mock_token";
        _isTestEnvironment = apiToken.StartsWith("re_mock", StringComparison.OrdinalIgnoreCase)
            || apiToken.StartsWith("test", StringComparison.OrdinalIgnoreCase)
            || string.IsNullOrWhiteSpace(apiToken);

        _logger.LogInformation("ResendEmailService initialized: isTestEnvironment={IsTestEnvironment}, apiTokenPrefix={ApiTokenPrefix}",
            _isTestEnvironment, apiToken?.Substring(0, Math.Min(8, apiToken?.Length ?? 0)) ?? "null");
    }

    public async Task SendEmailAsync(string to, string subject, string body, string? fromAddress = null, CancellationToken cancellationToken = default)
    {
        await SendCoreAsync(to, subject, body, fromAddress, cancellationToken);
    }

    public async Task<EmailSendResult> TrySendEmailAsync(string to, string subject, string body, string? fromAddress = null, CancellationToken cancellationToken = default)
    {
        var correlationId = Guid.NewGuid().ToString("N");
        var recipientHash = HashEmail(to);

        _logger.LogInformation(
            "Sending email via Resend: CorrelationId={CorrelationId}, RecipientHash={RecipientHash}, Subject='{Subject}'",
            correlationId, recipientHash, subject);

        if (_isTestEnvironment || to.EndsWith("@example.com", StringComparison.OrdinalIgnoreCase))
        {
            _logger.LogInformation("Test environment — simulating email send: CorrelationId={CorrelationId}", correlationId);
            return EmailSendResult.Success(correlationId);
        }

        var message = BuildMessage(to, subject, body, fromAddress);

        try
        {
            await _resend.EmailSendAsync(message, cancellationToken);
            _logger.LogInformation("Email sent via Resend: CorrelationId={CorrelationId}, RecipientHash={RecipientHash}",
                correlationId, recipientHash);
            return EmailSendResult.Success(correlationId);
        }
        catch (Exception ex)
        {
            var (statusCode, errorBody) = ExtractResendErrorDetails(ex);

            _logger.LogError(ex,
                "[RESEND_FAILURE] CorrelationId={CorrelationId}, RecipientHash={RecipientHash}, StatusCode={StatusCode}, ErrorBody={ErrorBody}",
                correlationId, recipientHash, statusCode, errorBody);

            return EmailSendResult.Failure(correlationId, statusCode, errorBody, ex.Message);
        }
    }

    private async Task SendCoreAsync(string to, string subject, string body, string? fromAddress, CancellationToken cancellationToken)
    {
        var correlationId = Guid.NewGuid().ToString("N");
        var recipientHash = HashEmail(to);

        _logger.LogInformation(
            "Sending email via Resend: CorrelationId={CorrelationId}, RecipientHash={RecipientHash}, Subject='{Subject}'",
            correlationId, recipientHash, subject);

        if (_isTestEnvironment || to.EndsWith("@example.com", StringComparison.OrdinalIgnoreCase))
        {
            _logger.LogInformation("Test environment — simulating email send: CorrelationId={CorrelationId}", correlationId);
            return;
        }

        var message = BuildMessage(to, subject, body, fromAddress);

        try
        {
            await _resend.EmailSendAsync(message, cancellationToken);
            _logger.LogInformation("Email sent via Resend: CorrelationId={CorrelationId}, RecipientHash={RecipientHash}",
                correlationId, recipientHash);
        }
        catch (Exception ex)
        {
            var (statusCode, errorBody) = ExtractResendErrorDetails(ex);

            _logger.LogError(ex,
                "[RESEND_FAILURE] CorrelationId={CorrelationId}, RecipientHash={RecipientHash}, StatusCode={StatusCode}, ErrorBody={ErrorBody}",
                correlationId, recipientHash, statusCode, errorBody);
        }
    }

    /// <summary>
    /// 2FA email-OTP challenge. Unlike the legacy SendEmailAsync, this MUST surface
    /// provider failures as exceptions — the OTP service depends on this
    /// signal to write the audit log, the dispatch-failed lifecycle event,
    /// and to refuse returning success to the user.
    ///</summary>
    public async Task SendEmailOtpAsync(string toEmail, string userName, string code, CancellationToken ct = default)
    {
        var correlationId = Guid.NewGuid().ToString("N");
        var recipientHash = HashEmail(toEmail);

        var html = EmailTemplates.GetEmailOtpEmail(userName, code);
        var subject = "Tu código de verificación - VeriFinca";

        _logger.LogInformation(
            "Sending OTP email via Resend: CorrelationId={CorrelationId}, RecipientHash={RecipientHash}",
            correlationId, recipientHash);

        var message = new EmailMessage
        {
            From = "VeriFinca <hola@handymansolutionrd.lat>",
            Subject = subject,
            HtmlBody = html,
        };
        message.To.Add(toEmail);

        if (_isTestEnvironment || toEmail.EndsWith("@example.com", StringComparison.OrdinalIgnoreCase))
        {
            _logger.LogInformation("Test environment — simulating OTP email send: CorrelationId={CorrelationId}", correlationId);
            return;
        }

        try
        {
            await _resend.EmailSendAsync(message, ct);
        }
        catch (Exception ex)
        {
            var (statusCode, errorBody) = ExtractResendErrorDetails(ex);
            _logger.LogError(ex,
                "[RESEND_FAILURE] OTP send failed: CorrelationId={CorrelationId}, RecipientHash={RecipientHash}, StatusCode={StatusCode}, ErrorBody={ErrorBody}",
                correlationId, recipientHash, statusCode, errorBody);
            throw;
        }
    }

    public async Task SendAccountVerificationAsync(string toEmail, string userName, string verificationToken, string? returnUrl = null, CancellationToken ct = default)
    {
        var html = EmailTemplates.GetAccountVerificationEmail(userName, verificationToken, returnUrl);
        await SendCoreAsync(toEmail, "Verificación de Cuenta - VeriFinca", html, "VeriFinca <hola@handymansolutionrd.lat>", ct);
    }

    public async Task SendDocumentUploadConfirmationAsync(string toEmail, string userName, string projectName, string documentType, CancellationToken ct = default)
    {
        var html = EmailTemplates.GetDocumentUploadConfirmationEmail(userName, projectName, documentType);
        await SendCoreAsync(toEmail, "Confirmación de Recepción de Documento - VeriFinca", html, "VeriFinca <notificaciones@handymansolutionrd.lat>", ct);
    }

    public async Task SendDocumentStatusUpdateAsync(string toEmail, string userName, string projectName, string documentType, string status, string? rejectionReason, CancellationToken ct = default)
    {
        var html = EmailTemplates.GetDocumentStatusUpdateEmail(userName, projectName, documentType, status, rejectionReason);
        string subject = $"Estatus de Documento Actualizado - VeriFinca ({status.ToUpper()})";
        await SendCoreAsync(toEmail, subject, html, "VeriFinca <notificaciones@handymansolutionrd.lat>", ct);
    }

    public async Task SendProjectCreatedAsync(string toEmail, string ownerName, string projectName, string projectId, CancellationToken ct = default)
    {
        var html = EmailTemplates.GetProjectCreatedEmail(ownerName, projectName, projectId);
        await SendCoreAsync(toEmail, "¡Tu Proyecto ha sido Creado! - VeriFinca", html, "VeriFinca <notificaciones@handymansolutionrd.lat>", ct);
    }

    public async Task SendSubscriptionActivatedAsync(string toEmail, string userName, string planName, string interval, CancellationToken ct = default)
    {
        var html = EmailTemplates.GetSubscriptionActivatedEmail(userName, planName, interval);
        await SendCoreAsync(toEmail, "Suscripción Activada - VeriFinca", html, "Suscripciones <suscripciones@handymansolutionrd.lat>", ct);
    }

    public async Task SendProjectStatusUpdateAsync(string toEmail, string userName, string projectName, string newStatus, CancellationToken ct = default)
    {
        bool isApproved = newStatus.Contains("Aprobado", StringComparison.OrdinalIgnoreCase);
        var html = EmailTemplates.GetProjectStatusChangeEmail(projectName, "", newStatus, isApproved);
        string subject = $"Actualización de Estado: Proyecto {projectName}";
        await SendCoreAsync(toEmail, subject, html, "VeriFinca <notificaciones@handymansolutionrd.lat>", ct);
    }

    public async Task SendPasswordResetAsync(string toEmail, string userName, string resetToken, string? returnUrl = null, CancellationToken ct = default)
    {
        var html = EmailTemplates.GetPasswordResetEmail(userName, resetToken, returnUrl);
        await SendCoreAsync(toEmail, "Recuperación de Contraseña - VeriFinca", html, "VeriFinca <hola@handymansolutionrd.lat>", ct);
    }

    private EmailMessage BuildMessage(string to, string subject, string body, string? fromAddress)
    {
        var message = new EmailMessage
        {
            From = fromAddress ?? $"{_fromName} <{_fromEmail}>",
            Subject = subject,
            HtmlBody = body
        };
        message.To.Add(to);
        return message;
    }

    private static string HashEmail(string email)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(email.ToLowerInvariant()));
        return Convert.ToHexString(bytes)[..16];
    }

    private static (int? StatusCode, string? ErrorBody) ExtractResendErrorDetails(Exception ex)
    {
        if (ex is ResendException resendEx)
        {
            return ((int?)resendEx.StatusCode, resendEx.ErrorType.ToString());
        }

        if (ex is HttpRequestException httpEx)
        {
            return (httpEx.StatusCode.HasValue ? (int)httpEx.StatusCode : null, httpEx.Message);
        }

        return (null, ex.Message);
    }
}



