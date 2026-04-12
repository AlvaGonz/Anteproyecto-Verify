namespace Api.Extensions;

using Microsoft.AspNetCore.Builder;
using Api.Health;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.Http;

public static class ApplicationBuilderExtensions
{
    public static IApplicationBuilder UseApiMiddleware(this WebApplication app)
    {
        app.UseExceptionHandler(opt => { }); // Minimal config to satisfy the middleware if ProblemDetails handles it


        app.UseCors("AllowAll");
        
        app.MapHealthChecks("/health", new HealthCheckOptions
        {
            ResponseWriter = HealthCheckResponseWriter.WriteResponse
        });

        app.MapGet("/api/status", (Microsoft.Extensions.Configuration.IConfiguration config) => 
        {
            var dbConfigured = !string.IsNullOrEmpty(config.GetConnectionString("DefaultConnection"));
            var blobConfigured = !string.IsNullOrEmpty(config["AzureBlob:ConnectionString"]);

            return Results.Ok(new 
            {
                ServiceName = "Enterprise API",
                Environment = app.Environment.EnvironmentName,
                Version = "1.0.0",
                Timestamp = System.DateTime.UtcNow,
                DatabaseConfigured = dbConfigured,
                BlobStorageConfigured = blobConfigured
            });
        });

        app.MapControllers();

        return app;
    }
}
