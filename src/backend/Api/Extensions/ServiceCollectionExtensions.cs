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
        services.AddSwaggerGen();
        services.AddHttpClient(); // Register HttpClient for external API calls and proxy
        services.AddHealthChecks()
            .AddSqlServer(configuration.GetConnectionString("DefaultConnection") ?? string.Empty, name: "Database")
            .AddCheck("BlobStorage", () => Microsoft.Extensions.Diagnostics.HealthChecks.HealthCheckResult.Healthy("Blob storage ready"));
        
        services.AddCors(options =>
        {
            options.AddPolicy("AllowAll", builder =>
                builder.WithOrigins("http://localhost:5173", "https://localhost:5173", "http://localhost:3000", "https://localhost:3000")
                       .AllowAnyMethod()
                       .AllowAnyHeader()
                       .AllowCredentials());
        });

        return services;
    }
}
