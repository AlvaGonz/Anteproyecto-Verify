namespace Tests.Integration.Infrastructure;

using Testcontainers.MsSql;

/// <summary>
/// Starts ONE SQL Server container per test collection.
/// Shared across all test classes via ICollectionFixture.
/// Container lifecycle: Start → RunMigrations → Tests → Dispose
/// </summary>
public sealed class SqlServerFixture : IAsyncLifetime
{
    // Use SQL Server 2022. For Apple Silicon (ARM), swap image with:
    // "mcr.microsoft.com/azure-sql-edge:latest"
    private readonly MsSqlContainer _container = new MsSqlBuilder()
        .WithImage("mcr.microsoft.com/mssql/server:2022-CU14-ubuntu-22.04")
        .WithPassword("Strong_Pwd_123!") // local test only, never in Key Vault
        .Build();

    public string ConnectionString => _container.GetConnectionString();

    public async Task InitializeAsync()
    {
        await _container.StartAsync();
    }

    public async Task DisposeAsync()
    {
        await _container.DisposeAsync();
    }
}

/// <summary>
/// xUnit collection definition — all test classes decorated with
/// [Collection("Database")] share the same container instance.
/// Container starts once, not once per test class.
/// </summary>
[CollectionDefinition("Database")]
public class DatabaseCollection : ICollectionFixture<SqlServerFixture> { }
