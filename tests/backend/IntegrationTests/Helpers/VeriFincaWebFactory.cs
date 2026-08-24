namespace Tests.Integration.Helpers;

using System.Threading.Tasks;
using DotNet.Testcontainers.Builders;
using Testcontainers.MsSql;
using Xunit;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using Infrastructure.Persistence;
using System.Linq;
using System.Collections.Generic;
using Microsoft.Extensions.Configuration;

public class VeriFincaWebFactory : WebApplicationFactory<Program>, IAsyncLifetime
{
    static VeriFincaWebFactory()
    {
        Environment.SetEnvironmentVariable("JWT_KEY", "SuperSecretTestJwtKey123456789012345678901234567890");
    }

    private readonly MsSqlContainer _msSqlContainer = new MsSqlBuilder("mcr.microsoft.com/mssql/server:2022-latest")
        .WithImage("mcr.microsoft.com/mssql/server:2022-latest")
        .Build();

    public async Task InitializeAsync()
    {
        Environment.SetEnvironmentVariable("JWT_KEY", "SuperSecretTestJwtKey123456789012345678901234567890");
        await _msSqlContainer.StartAsync();
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Development");
        builder.ConfigureAppConfiguration((context, config) =>
        {
            config.AddInMemoryCollection(new[]
            {
                new KeyValuePair<string, string?>("Jwt:Key", "SuperSecretTestJwtKey123456789012345678901234567890"),
                new KeyValuePair<string, string?>("Jwt:Issuer", "VeriFincaApi"),
                new KeyValuePair<string, string?>("Jwt:Audience", "VeriFincaClient"),
                new KeyValuePair<string, string?>("Stripe:SecretKey", "sk_test_mock"),
                new KeyValuePair<string, string?>("UseMockData", "true"),
                new KeyValuePair<string, string?>("AzureBlob:ConnectionString", "DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://127.0.0.1:10000/devstoreaccount1;"),
                new KeyValuePair<string, string?>("AzureBlob:ContainerName", "documents")
            });
        });

        builder.ConfigureServices(services =>
        {
            var descriptor = services.SingleOrDefault(
                d => d.ServiceType == typeof(DbContextOptions<AppDbContext>));

            if (descriptor != null)
            {
                services.Remove(descriptor);
            }

            services.AddDbContext<AppDbContext>(options =>
            {
                options.UseSqlServer(_msSqlContainer.GetConnectionString());
            });
        });
    }

    public new async Task DisposeAsync()
    {
        await _msSqlContainer.DisposeAsync();
    }
}
