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
    // In local/dev we ensure the database exists so Docker bootstraps cleanly
    // even when EF migrations tooling isn't installed in the container.
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    
    if (db.Database.ProviderName == "Microsoft.EntityFrameworkCore.SqlServer")
    {
        try
        {
            await db.Database.EnsureCreatedAsync();
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "EnsureCreatedAsync failed or DB already exists");
        }
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
