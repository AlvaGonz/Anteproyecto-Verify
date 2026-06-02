namespace Infrastructure.Services;

using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Notifications;
using Microsoft.Extensions.Logging;

public class MockEmailService : IEmailService
{
    private readonly ILogger<MockEmailService> _logger;

    public MockEmailService(ILogger<MockEmailService> logger)
    {
        _logger = logger;
    }

    public Task SendEmailAsync(string to, string subject, string body, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("--- MOCK EMAIL SENT ---");
        _logger.LogInformation("To: {To}", to);
        _logger.LogInformation("Subject: {Subject}", subject);
        _logger.LogInformation("Body: {Body}", body);
        _logger.LogInformation("-----------------------");
        
        return Task.CompletedTask;
    }

    public async Task SendAccountVerificationAsync(string toEmail, string userName, string verificationToken, CancellationToken ct = default)
    {
        await SendEmailAsync(toEmail, "Verificación de Cuenta", $"Hola {userName}, verifica tu cuenta con token: {verificationToken}", ct);
    }

    public async Task SendDocumentUploadConfirmationAsync(string toEmail, string userName, string projectName, string documentType, CancellationToken ct = default)
    {
        await SendEmailAsync(toEmail, "Confirmación de Documento", $"Hola {userName}, tu documento {documentType} para el proyecto {projectName} fue subido.", ct);
    }

    public async Task SendDocumentStatusUpdateAsync(string toEmail, string userName, string projectName, string documentType, string status, string? rejectionReason, CancellationToken ct = default)
    {
        string reason = rejectionReason != null ? $" Razón: {rejectionReason}" : "";
        await SendEmailAsync(toEmail, "Estatus de Documento", $"Hola {userName}, el estatus de tu {documentType} en {projectName} es: {status}.{reason}", ct);
    }

    public async Task SendProjectCreatedAsync(string toEmail, string ownerName, string projectName, string projectId, CancellationToken ct = default)
    {
        await SendEmailAsync(toEmail, "Proyecto Creado", $"Hola {ownerName}, tu proyecto {projectName} (ID: {projectId}) fue creado.", ct);
    }
}
