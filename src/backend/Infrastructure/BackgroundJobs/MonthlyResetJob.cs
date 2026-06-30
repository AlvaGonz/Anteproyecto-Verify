namespace Infrastructure.BackgroundJobs;

using System;
using System.Threading;
using System.Threading.Tasks;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

public class MonthlyResetJob : BackgroundService
{
    private readonly ILogger<MonthlyResetJob> _logger;
    private readonly IServiceProvider _serviceProvider;

    public MonthlyResetJob(ILogger<MonthlyResetJob> logger, IServiceProvider serviceProvider)
    {
        _logger = logger;
        _serviceProvider = serviceProvider;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("MonthlyResetJob is starting.");

        while (!stoppingToken.IsCancellationRequested)
        {
            // For a production system this should ideally use Quartz.NET or hangfire.
            // Here we check if it is the 1st of the month, or wait for next day.
            
            var now = DateTime.UtcNow;
            if (now.Day == 1 && now.Hour == 0) // Run once at midnight on the 1st
            {
                try
                {
                    await ResetQuotasAsync(stoppingToken);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error occurred executing MonthlyResetJob.");
                }
            }

            // Wait for next hour
            await Task.Delay(TimeSpan.FromHours(1), stoppingToken);
        }
    }

    private async Task ResetQuotasAsync(CancellationToken stoppingToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var users = await context.Usuarios.ToListAsync(stoppingToken);
        foreach (var user in users)
        {
            user.ResetearConsumosMensuales();
        }

        await context.SaveChangesAsync(stoppingToken);
        _logger.LogInformation("Successfully reset monthly quotas for all users.");
    }
}
