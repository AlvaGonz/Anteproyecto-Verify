using Api.Extensions;
using Application.DependencyInjection;
using Infrastructure.DependencyInjection;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

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
    
    // Ensure database exists
    await db.Database.EnsureCreatedAsync();

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
else if (useMock)
{
    await AppDbContextSeeder.SeedAsync(app.Services);
}

app.UseApiMiddleware();

app.Run();

public partial class Program { }
