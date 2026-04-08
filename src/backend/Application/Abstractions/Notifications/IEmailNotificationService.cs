namespace Application.Abstractions.Notifications;

using System.Threading;
using System.Threading.Tasks;
using Domain.Entities;

public interface IEmailNotificationService
{
    Task SendCriticalAlertAsync(string recipientEmail, AlertaValidacion alerta, CancellationToken ct = default);
}
