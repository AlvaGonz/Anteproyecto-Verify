using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using System.Collections.Generic;

namespace Api.Tests;

public class CustomWebApplicationFactory : WebApplicationFactory<Program>
{
    // RNF-3: los secretos se inyectan por variables de entorno (rango de
    // precedencia superior a los appsettings.json), nunca en archivos.
    static CustomWebApplicationFactory()
    {
        Environment.SetEnvironmentVariable("JWT_KEY", "test-jwt-key-0123456789abcdef0123456789abcdef");
        Environment.SetEnvironmentVariable("STORAGE_AES_KEY", Convert.ToBase64String(Enumerable.Repeat((byte)7, 32).ToArray()));
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureAppConfiguration((context, config) =>
        {
            config.AddInMemoryCollection(new Dictionary<string, string?>
            {
                { "Stripe:SecretKey", "sk_test_mock" }
            });
        });
    }
}
