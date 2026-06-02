namespace Application.Abstractions.Notifications;

using System.Threading;
using System.Threading.Tasks;

public interface IEmailService
{
    Task SendEmailAsync(string to, string subject, string body, CancellationToken cancellationToken = default);
    Task SendAccountVerificationAsync(string toEmail, string userName, string verificationToken, CancellationToken ct = default);
    Task SendDocumentUploadConfirmationAsync(string toEmail, string userName, string projectName, string documentType, CancellationToken ct = default);
    Task SendDocumentStatusUpdateAsync(string toEmail, string userName, string projectName, string documentType, string status, string? rejectionReason, CancellationToken ct = default);
    Task SendProjectCreatedAsync(string toEmail, string ownerName, string projectName, string projectId, CancellationToken ct = default);
}
