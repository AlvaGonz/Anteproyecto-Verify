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
if (app.Environment.IsDevelopment())
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
        catch (Exception ex)
        {
            logger.LogWarning($"Database is not ready yet. Retrying in 2 seconds... ({i + 1}/30). Error: {ex.Message}");
            await Task.Delay(2000);
        }
    }

    if (dbConnected)
    {
        if (db.Database.ProviderName == "Microsoft.EntityFrameworkCore.SqlServer")
        {
            var tableExists = false;
            try
            {
                using var cmd = db.Database.GetDbConnection().CreateCommand();
                cmd.CommandText = "SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Usuario'";
                var result = await cmd.ExecuteScalarAsync();
                tableExists = result != null && Convert.ToInt32(result) > 0;
            }
            catch
            {
                tableExists = false;
            }

            if (!tableExists)
            {
                var createScript = db.Database.GenerateCreateScript();
                var commands = createScript.Split(new[] { "GO\r\n", "GO\n" }, StringSplitOptions.RemoveEmptyEntries);
                foreach (var command in commands)
                {
                    if (!string.IsNullOrWhiteSpace(command))
                    {
                        try
                        {
                            await db.Database.ExecuteSqlRawAsync(command);
                        }
                        catch (Exception ex)
                        {
                            if (!ex.Message.Contains("already an object named", StringComparison.OrdinalIgnoreCase) && 
                                !ex.Message.Contains("already exists", StringComparison.OrdinalIgnoreCase))
                            {
                                throw;
                            }
                        }
                    }
                }
            }
        }
        else
        {
            await db.Database.EnsureCreatedAsync();
        }

        // Create missing tables in batches (ignoring duplicate table errors)
        try
        {
            var createScript = db.Database.GenerateCreateScript();
            var batches = createScript.Split(new[] { "\nGO", "\r\nGO", "GO\r\n", "GO\n" }, StringSplitOptions.RemoveEmptyEntries);
            foreach (var batch in batches)
            {
                if (string.IsNullOrWhiteSpace(batch)) continue;
                try
                {
                    await db.Database.ExecuteSqlRawAsync(batch);
                }
                catch
                {
                    // Ignore errors like already existing tables or constraints
                }
            }
        }
        catch
        {
            // Fallback in case script generation fails (e.g. SQLite mock)
        }

        await AppDbContextSeeder.SeedAsync(app.Services);
    }
    else
    {
        try
        {
            await db.Database.EnsureCreatedAsync();
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"=== DB INIT FAILED: {ex.Message} ===");
            throw;
        }
    }



    if (useMock)
    {
        await AppDbContextSeeder.SeedAsync(app.Services);
    }
}
else if (useMock)
{
    await AppDbContextSeeder.SeedAsync(app.Services);
}

    app.UseApiMiddleware();

    app.Run();
}
catch (Exception ex)
{
    Console.Error.WriteLine("=== FATAL STARTUP CRASH ===");
    Console.Error.WriteLine(ex.ToString());
    throw;
}

public partial class Program { }
