namespace Application.Abstractions.Notifications;

using System.Threading;
using System.Threading.Tasks;

public interface IEmailService
{
    Task SendEmailAsync(string to, string subject, string body, string? fromAddress = null, CancellationToken cancellationToken = default);
    Task SendAccountVerificationAsync(string toEmail, string userName, string verificationToken, string? returnUrl = null, CancellationToken ct = default);
    Task SendDocumentUploadConfirmationAsync(string toEmail, string userName, string projectName, string documentType, CancellationToken ct = default);
    Task SendDocumentStatusUpdateAsync(string toEmail, string userName, string projectName, string documentType, string status, string? rejectionReason, CancellationToken ct = default);
    Task SendProjectCreatedAsync(string toEmail, string ownerName, string projectName, string projectId, CancellationToken ct = default);
    Task SendSubscriptionActivatedAsync(string toEmail, string userName, string planName, string interval, CancellationToken ct = default);
    Task SendProjectStatusUpdateAsync(string toEmail, string userName, string projectName, string newStatus, CancellationToken ct = default);
    Task SendPasswordResetAsync(string toEmail, string userName, string resetToken, string? returnUrl = null, CancellationToken ct = default);

    /// <summary>
    /// Sends the 2FA email-OTP challenge to the user. Implementations MUST
    /// surface provider failures as exceptions so callers can detect a
    /// swallowed request. Contract: returning normally = provider accepted.
    ///</summary>
    Task SendEmailOtpAsync(string toEmail, string userName, string code, CancellationToken ct = default);
}

