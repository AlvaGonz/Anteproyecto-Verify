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
    
    if (db.Database.ProviderName == "Microsoft.EntityFrameworkCore.SqlServer")
    {
        var tableExists = false;
        try
        {
            var conn = db.Database.GetDbConnection();
            if (conn.State != System.Data.ConnectionState.Open)
            {
                await conn.OpenAsync();
            }
            using var cmd = conn.CreateCommand();
            cmd.CommandText = "SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Usuarios'";
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

public partial class Program { }
