using Api.Extensions;
using Application.DependencyInjection;
using Infrastructure.DependencyInjection;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System;

try
{
    var builder = WebApplication.CreateBuilder(args);

    // Add layers
    builder.Services.AddApplication();
    builder.Services.AddInfrastructure(builder.Configuration);
    builder.Services.AddApiServices(builder.Configuration);

    var app = builder.Build();

    var useMock = builder.Configuration.GetValue<bool>("UseMockData");
    if (app.Environment.IsDevelopment() || useMock)
    {
        using var scope = app.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
        
        // Resilience: Wait for database to be ready and connection to succeed
        var dbConnected = false;
        for (int i = 0; i < 30; i++)
        {
            try
            {
                var conn = db.Database.GetDbConnection();
                if (conn.State != System.Data.ConnectionState.Open)
                {
                    await conn.OpenAsync();
                }
                dbConnected = true;
                logger.LogInformation("Database connection verified successfully.");
                break;
            }
            catch (Microsoft.Data.SqlClient.SqlException ex) when (ex.Number == 4060)
            {
                logger.LogInformation("SQL Server is up, but database does not exist yet. Proceeding to migrations...");
                dbConnected = true;
                break;
            }
            catch (Exception ex)
            {
                logger.LogWarning($"Database is not ready yet. Retrying in 2 seconds... ({i + 1}/30). Error: {ex.Message}");
                await Task.Delay(2000);
            }
        }

        if (dbConnected)
        {
            // Apply pending migrations (creates database if not exists, applies all migrations)
            if (db.Database.ProviderName == "Microsoft.EntityFrameworkCore.SqlServer")
            {
                logger.LogInformation("Applying database migrations...");
                try
                {
                    await db.Database.MigrateAsync();
                    logger.LogInformation("Database migrations applied successfully.");
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "Fatal: database migration failed on startup.");
                    throw;  // App no debe arrancar con DB corrupta
                }
            }
            else
            {
                // For non-SQL Server providers (e.g., SQLite in tests), use EnsureCreated
                await db.Database.EnsureCreatedAsync();
            }

            await AppDbContextSeeder.SeedAsync(app.Services);
        }
        else
        {
            logger.LogError("Could not connect to database after 30 retries.");
            throw new InvalidOperationException("Database connection failed after retries.");
        }
    }

    if (string.IsNullOrEmpty(builder.Configuration["Stripe:SecretKey"]))
    {
        var logger = app.Services.GetRequiredService<ILogger<Program>>();
        logger.LogCritical("FATAL STARTUP ERROR: Stripe:SecretKey is not configured. The application cannot start without it.");
        throw new InvalidOperationException("Stripe:SecretKey is missing from configuration.");
    }

    app.UseApiMiddleware();

    app.Run();
}
catch (Exception ex)
{
    if (ex.GetType().Name == "HostAbortedException")
    {
        // Ignore this exception as it is thrown intentionally by EF Core tools
        return;
    }

    Console.Error.WriteLine("=== FATAL STARTUP CRASH ===");
    Console.Error.WriteLine(ex.ToString());
    throw;
}

public partial class Program { }