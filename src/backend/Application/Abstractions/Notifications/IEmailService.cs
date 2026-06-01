namespace Application.Abstractions.Notifications;

using System.Threading;
using System.Threading.Tasks;

public interface IEmailService
{
    Task SendEmailAsync(string to, string subject, string body, CancellationToken cancellationToken = default);
}
