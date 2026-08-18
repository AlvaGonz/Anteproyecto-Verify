namespace Infrastructure.BackgroundJobs;

using System;
using System.Threading;
using System.Threading.Tasks;
using Application.Features.Account.Commands.PurgeAccounts;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

public class AccountPurgeJob : BackgroundService
{
    private readonly ILogger<AccountPurgeJob> _logger;
    private readonly IServiceProvider _serviceProvider;

    public AccountPurgeJob(ILogger<AccountPurgeJob> logger, IServiceProvider serviceProvider)
    {
        _logger = logger;
        _serviceProvider = serviceProvider;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("AccountPurgeJob is starting.");

        while (!stoppingToken.IsCancellationRequested)
        {
            var now = DateTime.UtcNow;

            try
            {
                await PurgeExpiredAccountsAsync(stoppingToken);
            }
            catch (OperationCanceledException)
            {
                break;
            }
            catch (Exception ex)
            {
                if (!stoppingToken.IsCancellationRequested)
                {
                    _logger.LogError(ex, "Error occurred executing AccountPurgeJob.");
                }
            }

            try
            {
                // Run daily
                var nextRun = now.Date.AddDays(1).AddHours(2); // 02:00 UTC daily
                var delay = nextRun - DateTime.UtcNow;
                if (delay < TimeSpan.Zero)
                    delay = TimeSpan.FromHours(1); // fallback: check again in 1 hour

                await Task.Delay(delay, stoppingToken);
            }
            catch (OperationCanceledException)
            {
                break;
            }
        }
    }

    private async Task PurgeExpiredAccountsAsync(CancellationToken stoppingToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var handler = scope.ServiceProvider.GetRequiredService<PurgeAccountsCommandHandler>();

        var result = await handler.Handle(new PurgeAccountsCommand(), stoppingToken);

        if (result.PurgedCount > 0)
        {
            _logger.LogInformation("AccountPurgeJob purged {Count} accounts.", result.PurgedCount);
        }
    }
}
