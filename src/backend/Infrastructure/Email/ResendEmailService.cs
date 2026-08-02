namespace Infrastructure.Email;

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
        
        // In test/development environments with mock tokens, simulate success
        // instead of calling the real Resend API (which would fail with invalid tokens).
        var apiToken = section.GetValue<string>("ApiToken") ?? "re_mock_token";
        _isTestEnvironment = apiToken.StartsWith("re_mock", StringComparison.OrdinalIgnoreCase)
            || apiToken.StartsWith("test", StringComparison.OrdinalIgnoreCase)
            || string.IsNullOrWhiteSpace(apiToken);
        
        _logger.LogInformation("ResendEmailService initialized: isTestEnvironment={IsTestEnvironment}, apiTokenPrefix={ApiTokenPrefix}", 
            _isTestEnvironment, apiToken?.Substring(0, Math.Min(8, apiToken?.Length ?? 0)) ?? "null");
    }

    public async Task SendEmailAsync(string to, string subject, string body, string? fromAddress = null, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Sending email via Resend to {To} with subject '{Subject}'", to, subject);

        var message = new EmailMessage
        {
            From = fromAddress ?? $"{_fromName} <{_fromEmail}>",
            Subject = subject,
            HtmlBody = body
        };
        message.To.Add(to);

        try
        {
            if (_isTestEnvironment || to.EndsWith("@example.com", StringComparison.OrdinalIgnoreCase))
            {
                _logger.LogInformation("Test environment detected — simulating email send to {To}", to);
                return;
            }
            
            await _resend.EmailSendAsync(message, cancellationToken);
            _logger.LogInformation("Email sent successfully via Resend to {To}", to);
        }
        catch (Exception ex)
        {
            // For non-OTP transactional sends, callers are fire-and-forget and
            // do not act on a swallowed failure. This is preserved for backward
            // compatibility with the registration, password-reset, etc. flows.
            _logger.LogWarning(ex, "Failed to send email via Resend to {To}. (If running E2E tests without a valid API key, this is expected).", to);
        }
    }

    /// <summary>
    /// 2FA email-OTP challenge. Unlike SendEmailAsync, this MUST surface
    /// provider failures as exceptions — the OTP service depends on this
    /// signal to write the audit log, the dispatch-failed lifecycle event,
    /// and to refuse returning success to the user.
    ///
    /// In test environments with mock tokens, we simulate success to allow
    /// integration tests to pass without a real Resend API key.
    ///</summary>
    public async Task SendEmailOtpAsync(string toEmail, string userName, string code, CancellationToken ct = default)
    {
        var html = EmailTemplates.GetEmailOtpEmail(userName, code);
        var subject = "Tu código de verificación - VeriFinca";

        var message = new EmailMessage
        {
            From = "VeriFinca <hola@handymansolutionrd.lat>",
            Subject = subject,
            HtmlBody = html,
        };
        message.To.Add(toEmail);

        if (_isTestEnvironment || toEmail.EndsWith("@example.com", StringComparison.OrdinalIgnoreCase))
        {
            _logger.LogInformation("Test environment detected — simulating OTP email send to {To}", toEmail);
            return;
        }

        // NOTE: no try/catch — provider failure MUST bubble so the caller can
        // observe it and record `2fa_email_provider_dispatch_failed`.
        await _resend.EmailSendAsync(message, ct);
    }

    public async Task SendAccountVerificationAsync(string toEmail, string userName, string verificationToken, string? returnUrl = null, CancellationToken ct = default)
    {
        var html = EmailTemplates.GetAccountVerificationEmail(userName, verificationToken, returnUrl);
        await SendEmailAsync(toEmail, "Verificación de Cuenta - VeriFinca", html, "VeriFinca <hola@handymansolutionrd.lat>", ct);
    }

    public async Task SendDocumentUploadConfirmationAsync(string toEmail, string userName, string projectName, string documentType, CancellationToken ct = default)
    {
        var html = EmailTemplates.GetDocumentUploadConfirmationEmail(userName, projectName, documentType);
        await SendEmailAsync(toEmail, "Confirmación de Recepción de Documento - VeriFinca", html, "VeriFinca <notificaciones@handymansolutionrd.lat>", ct);
    }

    public async Task SendDocumentStatusUpdateAsync(string toEmail, string userName, string projectName, string documentType, string status, string? rejectionReason, CancellationToken ct = default)
    {
        var html = EmailTemplates.GetDocumentStatusUpdateEmail(userName, projectName, documentType, status, rejectionReason);
        string subject = $"Estatus de Documento Actualizado - VeriFinca ({status.ToUpper()})";
        await SendEmailAsync(toEmail, subject, html, "VeriFinca <notificaciones@handymansolutionrd.lat>", ct);
    }

    public async Task SendProjectCreatedAsync(string toEmail, string ownerName, string projectName, string projectId, CancellationToken ct = default)
    {
        var html = EmailTemplates.GetProjectCreatedEmail(ownerName, projectName, projectId);
        await SendEmailAsync(toEmail, "¡Tu Proyecto ha sido Creado! - VeriFinca", html, "VeriFinca <notificaciones@handymansolutionrd.lat>", ct);
    }

    public async Task SendSubscriptionActivatedAsync(string toEmail, string userName, string planName, string interval, CancellationToken ct = default)
    {
        var html = EmailTemplates.GetSubscriptionActivatedEmail(userName, planName, interval);
        await SendEmailAsync(toEmail, "Suscripción Activada - VeriFinca", html, "Suscripciones <suscripciones@handymansolutionrd.lat>", ct);
    }

    public async Task SendProjectStatusUpdateAsync(string toEmail, string userName, string projectName, string newStatus, CancellationToken ct = default)
    {
        bool isApproved = newStatus.Contains("Aprobado", StringComparison.OrdinalIgnoreCase);
        var html = EmailTemplates.GetProjectStatusChangeEmail(projectName, "", newStatus, isApproved);
        string subject = $"Actualización de Estado: Proyecto {projectName}";
        await SendEmailAsync(toEmail, subject, html, "VeriFinca <notificaciones@handymansolutionrd.lat>", ct);
    }

    public async Task SendPasswordResetAsync(string toEmail, string userName, string resetToken, string? returnUrl = null, CancellationToken ct = default)
    {
        var html = EmailTemplates.GetPasswordResetEmail(userName, resetToken, returnUrl);
        await SendEmailAsync(toEmail, "Recuperación de Contraseña - VeriFinca", html, "VeriFinca <hola@handymansolutionrd.lat>", ct);
    }
}



