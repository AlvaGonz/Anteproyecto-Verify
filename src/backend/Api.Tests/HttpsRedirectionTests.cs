namespace Api.Tests;

using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Xunit;

/// <summary>
/// RNF-3: en cualquier entorno distinto de Development el API debe redirigir
/// todo tráfico HTTP a HTTPS (301) — nunca servir contenido en claro.
/// </summary>
public class HttpsRedirectionTests
{
    private sealed class ProductionFactory : WebApplicationFactory<Program>
    {
        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            builder.UseEnvironment("Production");
            builder.ConfigureAppConfiguration((_, config) =>
            {
                config.AddInMemoryCollection(new Dictionary<string, string?>
                {
                    { "Stripe:SecretKey", "sk_test_mock" },
                    { "Jwt:Key", "test-jwt-key-0123456789abcdef0123456789abcdef" },
                    { "Storage:AesEncryptionKey", "MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY=" },
                    { "ConnectionStrings:DefaultConnection", "Server=localhost;Database=test;Integrated Security=True;TrustServerCertificate=True" },
                });
            });
        }
    }

    [Fact]
    public async Task Get_ApiStatus_WithHttp_Should_RedirectToHttps_With301()
    {
        using var factory = new ProductionFactory();
        var client = factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            AllowAutoRedirect = false,
        });

        var response = await client.GetAsync("/api/status");

        Assert.Equal(HttpStatusCode.MovedPermanently, response.StatusCode);
        Assert.NotNull(response.Headers.Location);
        Assert.Equal("https", response.Headers.Location!.Scheme);
    }
}
