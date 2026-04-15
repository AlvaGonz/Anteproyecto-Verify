using Application.DependencyInjection;
using Infrastructure.DependencyInjection;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

var host = Host.CreateDefaultBuilder(args)
    .ConfigureAppConfiguration(config =>
    {
        // Read env vars (ConnectionStrings__DefaultConnection, etc.)
        config.AddEnvironmentVariables();
    })
    .ConfigureServices((context, services) =>
    {
        services.AddLogging(b => b.AddConsole());
        services.AddApplication();
        services.AddInfrastructure(context.Configuration);
    })
    .Build();

using var scope = host.Services.CreateScope();
var logger = scope.ServiceProvider.GetRequiredService<ILoggerFactory>().CreateLogger("DbSeeder");

try
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await db.Database.EnsureCreatedAsync();
    await AppDbContextSeeder.SeedAsync(host.Services);
    logger.LogInformation("db:seed completed.");
    return 0;
}
catch (Exception ex)
{
    logger.LogError(ex, "db:seed failed.");
    return 1;
}

