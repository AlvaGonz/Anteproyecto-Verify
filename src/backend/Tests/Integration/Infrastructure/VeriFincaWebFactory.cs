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

            // Disable real email sending in tests
            var emailServiceDescriptor = services.SingleOrDefault(d => d.ServiceType == typeof(Application.Abstractions.Notifications.IEmailService));
            if (emailServiceDescriptor != null)
                services.Remove(emailServiceDescriptor);
            services.AddScoped<Application.Abstractions.Notifications.IEmailService, NullEmailService>();
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
                ["JwtSettings:ExpirationMinutes"] = "60",
                ["Stripe:SecretKey"] = "sk_test_dummy_for_integration_tests",
                ["AzureBlob:ConnectionString"] =
                    "DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;" +
                    "AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;" +
                    "BlobEndpoint=http://localhost:10000/devstoreaccount1;",
                ["AzureBlob:ContainerName"] = "verifinca-documents",
                ["IsTestingEnvironment"] = "true"
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

        await db.Database.MigrateAsync();
        await AppDbContextSeeder.SeedAsync(Services);
    }
}

/// <summary>
/// Prevents real emails from being sent during integration tests.
///</summary>
internal sealed class NullEmailService : Application.Abstractions.Notifications.IEmailService
{
    public Task SendEmailAsync(string to, string subject, string body, string? fromAddress = null, System.Threading.CancellationToken ct = default)
        => Task.CompletedTask;

    public Task<Application.Abstractions.Notifications.EmailSendResult> TrySendEmailAsync(string to, string subject, string body, string? fromAddress = null, System.Threading.CancellationToken ct = default)
        => Task.FromResult(Application.Abstractions.Notifications.EmailSendResult.Success("null-email-service-test"));

    public Task SendAccountVerificationAsync(string toEmail, string userName, string verificationToken, string? returnUrl = null, System.Threading.CancellationToken ct = default)
        => Task.CompletedTask;

    public Task SendDocumentUploadConfirmationAsync(string toEmail, string userName, string projectName, string documentType, System.Threading.CancellationToken ct = default)
        => Task.CompletedTask;

    public Task SendDocumentStatusUpdateAsync(string toEmail, string userName, string projectName, string documentType, string status, string? rejectionReason, System.Threading.CancellationToken ct = default)
        => Task.CompletedTask;

    public Task SendProjectCreatedAsync(string toEmail, string ownerName, string projectName, string projectId, System.Threading.CancellationToken ct = default)
        => Task.CompletedTask;

    public Task SendSubscriptionActivatedAsync(string toEmail, string userName, string planName, string interval, System.Threading.CancellationToken ct = default)
        => Task.CompletedTask;

    public Task SendPasswordResetAsync(string toEmail, string userName, string resetToken, string? returnUrl = null, System.Threading.CancellationToken ct = default)
        => Task.CompletedTask;

    public Task SendProjectStatusUpdateAsync(string toEmail, string userName, string projectName, string newStatus, System.Threading.CancellationToken ct = default)
        => Task.CompletedTask;

    public Task SendEmailOtpAsync(string toEmail, string userName, string code, System.Threading.CancellationToken ct = default)
        => Task.CompletedTask;
}
