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
}
