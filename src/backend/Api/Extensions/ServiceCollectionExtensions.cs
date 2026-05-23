namespace Api.Extensions;

using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddApiServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddControllers();
        services.AddProblemDetails();
        services.AddEndpointsApiExplorer();
        services.AddHealthChecks()
            .AddSqlServer(configuration.GetConnectionString("DefaultConnection") ?? string.Empty, name: "Database")
            .AddCheck("BlobStorage", () => Microsoft.Extensions.Diagnostics.HealthChecks.HealthCheckResult.Healthy("Blob storage ready"));
        
        services.AddCors(options =>
        {
            var allowedOrigins = Environment.GetEnvironmentVariable("ALLOWED_ORIGINS")
                ?.Split(",", StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                ?? new[] { "http://localhost:5173" };

            options.AddPolicy("AllowFrontend", policy =>
                policy.WithOrigins(allowedOrigins)
                    .AllowAnyHeader()
                    .AllowAnyMethod());
        });

        return services;
    }
}
