namespace Infrastructure.Services;

using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Notifications;
using Domain.Entities;
using Microsoft.Extensions.Logging;

public class EmailNotificationService : IEmailNotificationService
{
    private readonly ILogger<EmailNotificationService> _logger;

    public EmailNotificationService(ILogger<EmailNotificationService> logger)
    {
        _logger = logger;
    }

    public async Task SendCriticalAlertAsync(string recipientEmail, AlertaValidacion alerta, CancellationToken ct = default)
    {
        // Mock implementation
        await Task.Delay(100, ct);
        _logger.LogInformation("Sending critical alert email to {Email} for Alert {AlertId}: {Titulo}", recipientEmail, alerta.Id, alerta.Titulo);
    }
}
