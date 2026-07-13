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

        app.UseSwagger();
        app.UseSwaggerUI();

        app.UseCors("ViteDev");

        var wwwrootPath = System.IO.Path.Combine(System.IO.Directory.GetCurrentDirectory(), "wwwroot", "uploads");
        if (!System.IO.Directory.Exists(wwwrootPath))
        {
            System.IO.Directory.CreateDirectory(wwwrootPath);
        }

        app.UseStaticFiles();
        
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
                ServiceName = "Corporativo API",
                Environment = app.Environment.EnvironmentName,
                Version = "1.0.0",
                Timestamp = System.DateTime.UtcNow,
                DatabaseConfigured = dbConfigured,
                BlobStorageConfigured = blobConfigured
            });
        });

        var avatarsDirectory = System.IO.Path.Combine(System.IO.Directory.GetCurrentDirectory(), "storage", "avatars");
        if (!System.IO.Directory.Exists(avatarsDirectory))
        {
            System.IO.Directory.CreateDirectory(avatarsDirectory);
        }

        app.UseStaticFiles(new StaticFileOptions
        {
            FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(avatarsDirectory),
            RequestPath = "/avatars"
        });

        app.UseAuthentication();
        app.UseAuthorization();
        app.MapControllers();

        return app;
    }
}
