namespace Tests.Integration.Infrastructure;

using System.Net.Http.Headers;
using System.Net.Http.Json;
using Application.Features.Auth.Commands.RegisterUser;
using global::Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

/// <summary>
/// Base class for all integration tests.
/// Handles: factory creation, DB init, JWT helpers, client creation.
/// </summary>
[Collection("Database")]
public abstract class IntegrationTestBase : IAsyncLifetime
{
    protected readonly VeriFincaWebFactory Factory;
    protected HttpClient Client;

    protected IntegrationTestBase(SqlServerFixture sqlFixture)
    {
        Factory = new VeriFincaWebFactory(sqlFixture.ConnectionString);
        Client = Factory.CreateClient();
    }

    public async Task InitializeAsync()
    {
        await Factory.InitializeDatabaseAsync();
    }

    public async Task DisposeAsync()
    {
        Client.Dispose();
        await Factory.DisposeAsync();
    }

    // ── Auth helpers ──────────────────────────────────────────────

    protected async Task<string> RegisterAndGetTokenAsync(
        string email = "test@test.com",
        string password = "Test123!")
    {
        var registerResponse = await Client.PostAsJsonAsync(
            "/api/auth/register", new
            {
                nombre = "Test",
                apellido = "User",
                email,
                password,
                confirmPassword = password,
                telefono = "8091234567",
                cedula = "001-0000001-1"
            });

        registerResponse.EnsureSuccessStatusCode();

        var loginResponse = await Client.PostAsJsonAsync(
            "/api/auth/login", new { email, password });

        loginResponse.EnsureSuccessStatusCode();

        var loginBody = await loginResponse.Content
            .ReadFromJsonAsync<LoginResponseDto>();

        return loginBody!.AccessToken;
    }

    protected void SetBearerToken(string token)
    {
        Client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);
    }

    protected void ClearAuth()
    {
        Client.DefaultRequestHeaders.Authorization = null;
    }

    // ── Plan helpers ──────────────────────────────────────────────

    /// <summary>
    /// Directly assigns a plan to a user via admin API or direct DB access.
    /// </summary>
    protected async Task AssignPlanToUserAsync(
        Guid userId, string planName)
    {
        using var scope = Factory.Services.CreateScope();
        var db = scope.ServiceProvider
            .GetRequiredService<AppDbContext>();

        var plan = await db.PlanSuscripciones
            .FirstAsync(p => p.NombrePlan == planName);
        var user = await db.Usuarios
            .FirstAsync(u => u.Id == userId);

        user.AsignarPlan(plan.Idsuscripcion);
        await db.SaveChangesAsync();
    }
}

// Response DTOs for test deserialization
public record LoginResponseDto(string AccessToken, string RefreshToken);
public record ErrorDto(string Error, string Message,
    string? Tier = null, int? Limit = null);
