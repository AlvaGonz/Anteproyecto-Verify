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
        string? email = null,
        string password = "Test123!")
    {
        email ??= $"test_{Guid.NewGuid()}@test.com";

        // Generate a valid Dominican Republic Cedula
        var baseDigits = $"001{new Random().Next(1000000, 9999999):D7}";
        int[] multipliers = { 1, 2, 1, 2, 1, 2, 1, 2, 1, 2 };
        int sum = 0;
        for (int i = 0; i < 10; i++)
        {
            int product = int.Parse(baseDigits[i].ToString()) * multipliers[i];
            if (product >= 10) product -= 9;
            sum += product;
        }
        int checkDigit = (10 - (sum % 10)) % 10;
        var cedula = $"{baseDigits.Substring(0, 3)}-{baseDigits.Substring(3, 7)}-{checkDigit}";

        var registerResponse = await Client.PostAsJsonAsync(
            "/api/auth/register", new
            {
                nombre = "Test",
                apellido = "User",
                email,
                password,
                confirmPassword = password,
                telefono = "8091234567",
                cedula
            });

        if (!registerResponse.IsSuccessStatusCode)
        {
            var errorBody = await registerResponse.Content.ReadAsStringAsync();
            throw new Exception($"Registration failed with {registerResponse.StatusCode}: {errorBody}");
        }

        // Force email verification via DB since we can't click the email link in a test
        using (var scope = Factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var user = await db.Usuarios.FirstOrDefaultAsync(u => u.CorreoElectronico == email);
            if (user != null)
            {
                user.VerificarEmail(user.TokenVerificacion!);
                await db.SaveChangesAsync();
            }
        }

        var loginResponse = await Client.PostAsJsonAsync(
            "/api/auth/login", new { email, password });

        if (!loginResponse.IsSuccessStatusCode)
        {
            var errorBody = await loginResponse.Content.ReadAsStringAsync();
            throw new Exception($"Login failed with {loginResponse.StatusCode}: {errorBody}");
        }

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

        var plan = await db.PlanesSuscripcion
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
