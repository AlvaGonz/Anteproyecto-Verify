namespace Tests.Integration.Infrastructure;

using Application.Abstractions.Persistence;
using global::Infrastructure.Persistence;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

/// <summary>
/// Boots the real API pipeline replacing only the DB connection string.
/// All other services (JWT, EF, repositories, handlers) are REAL.
/// EF migrations run automatically on first use.
/// </summary>
public sealed class VeriFincaWebFactory : WebApplicationFactory<Program>
{
    private readonly string _connectionString;

    public VeriFincaWebFactory(string connectionString)
    {
        _connectionString = connectionString;
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");

        builder.ConfigureServices(services =>
        {
            // 1. Remove the production DbContext registration
            var descriptor = services.SingleOrDefault(d =>
                d.ServiceType == typeof(DbContextOptions<AppDbContext>));
            if (descriptor != null)
                services.Remove(descriptor);

            // 2. Register AppDbContext pointing to the TestContainers SQL instance
            services.AddDbContext<AppDbContext>(options =>
                options.UseSqlServer(_connectionString,
                    sql => sql.MigrationsAssembly(
                        typeof(AppDbContext).Assembly.FullName)));
        });

        builder.ConfigureAppConfiguration((context, config) =>
        {
            // Override JWT settings for tests (use a known test secret)
            config.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["JwtSettings:Secret"] =
                    "test-secret-key-min-32-chars-long!!",
                ["JwtSettings:Issuer"] = "verifinca-test",
                ["JwtSettings:Audience"] = "verifinca-test-client",
                ["JwtSettings:ExpirationMinutes"] = "60"
            });
        });
    }

    /// <summary>
    /// Applies EF migrations + seeds plans.
    /// Call once before running tests in the collection.
    /// </summary>
    public async Task InitializeDatabaseAsync()
    {
        using var scope = Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        await db.Database.EnsureCreatedAsync();
        await AppDbContextSeeder.SeedAsync(Services);
    }
}
