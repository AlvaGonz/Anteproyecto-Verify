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
    }

    public async Task SendEmailAsync(string to, string subject, string body, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Sending email via Resend to {To} with subject '{Subject}'", to, subject);

        var message = new EmailMessage
        {
            From = $"{_fromName} <{_fromEmail}>",
            Subject = subject,
            HtmlBody = body
        };
        message.To.Add(to);

        await _resend.EmailSendAsync(message, cancellationToken);
        _logger.LogInformation("Email sent successfully via Resend to {To}", to);
    }

    public async Task SendAccountVerificationAsync(string toEmail, string userName, string verificationToken, CancellationToken ct = default)
    {
        var html = EmailTemplates.GetAccountVerificationEmail(userName, verificationToken);
        await SendEmailAsync(toEmail, "Verificación de Cuenta - VeriFinca", html, ct);
    }

    public async Task SendDocumentUploadConfirmationAsync(string toEmail, string userName, string projectName, string documentType, CancellationToken ct = default)
    {
        var html = EmailTemplates.GetDocumentUploadConfirmationEmail(userName, projectName, documentType);
        await SendEmailAsync(toEmail, "Confirmación de Recepción de Documento - VeriFinca", html, ct);
    }

    public async Task SendDocumentStatusUpdateAsync(string toEmail, string userName, string projectName, string documentType, string status, string? rejectionReason, CancellationToken ct = default)
    {
        var html = EmailTemplates.GetDocumentStatusUpdateEmail(userName, projectName, documentType, status, rejectionReason);
        string subject = $"Estatus de Documento Actualizado - VeriFinca ({status.ToUpper()})";
        await SendEmailAsync(toEmail, subject, html, ct);
    }

    public async Task SendProjectCreatedAsync(string toEmail, string ownerName, string projectName, string projectId, CancellationToken ct = default)
    {
        var html = EmailTemplates.GetProjectCreatedEmail(ownerName, projectName, projectId);
        await SendEmailAsync(toEmail, "¡Tu Proyecto ha sido Creado! - VeriFinca", html, ct);
    }
}
