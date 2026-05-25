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

    public Task SendAccountVerificationAsync(string toEmail, string userName, string verificationToken, CancellationToken ct = default)
    {
        _logger.LogInformation("--- MOCK EMAIL: Account Verification ---");
        _logger.LogInformation("To: {To}", toEmail);
        _logger.LogInformation("User: {User}", userName);
        _logger.LogInformation("Token: {Token}", verificationToken);
        _logger.LogInformation("----------------------------------------");
        return Task.CompletedTask;
    }

    public Task SendDocumentUploadConfirmationAsync(string toEmail, string userName, string projectName, string documentType, CancellationToken ct = default)
    {
        _logger.LogInformation("--- MOCK EMAIL: Document Upload Confirmation ---");
        _logger.LogInformation("To: {To}", toEmail);
        _logger.LogInformation("User: {User}", userName);
        _logger.LogInformation("Project: {Project}", projectName);
        _logger.LogInformation("Doc Type: {DocType}", documentType);
        _logger.LogInformation("------------------------------------------------");
        return Task.CompletedTask;
    }

    public Task SendDocumentStatusUpdateAsync(string toEmail, string userName, string projectName, string documentType, string status, string? rejectionReason, CancellationToken ct = default)
    {
        _logger.LogInformation("--- MOCK EMAIL: Document Status Update ---");
        _logger.LogInformation("To: {To}", toEmail);
        _logger.LogInformation("User: {User}", userName);
        _logger.LogInformation("Project: {Project}", projectName);
        _logger.LogInformation("Doc Type: {DocType}", documentType);
        _logger.LogInformation("Status: {Status}", status);
        _logger.LogInformation("Rejection Reason: {Reason}", rejectionReason ?? "N/A");
        _logger.LogInformation("------------------------------------------");
        return Task.CompletedTask;
    }

    public Task SendProjectCreatedAsync(string toEmail, string ownerName, string projectName, string projectId, CancellationToken ct = default)
    {
        _logger.LogInformation("--- MOCK EMAIL: Project Created ---");
        _logger.LogInformation("To: {To}", toEmail);
        _logger.LogInformation("Owner: {Owner}", ownerName);
        _logger.LogInformation("Project: {Project} (ID: {ProjId})", projectName, projectId);
        _logger.LogInformation("-----------------------------------");
        return Task.CompletedTask;
    }
}
