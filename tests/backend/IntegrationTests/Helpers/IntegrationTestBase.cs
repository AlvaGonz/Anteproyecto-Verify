namespace Tests.Integration.Helpers;

using System;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Xunit;
using Microsoft.Extensions.DependencyInjection;
using Infrastructure.Persistence;
using Domain.Entities;
using Domain.Enums;
using Application.Features.Auth.Commands.RegisterUser;
using Application.Features.Auth.Commands.LoginUser;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

public abstract class IntegrationTestBase : IClassFixture<VeriFincaWebFactory>
{
    protected readonly HttpClient _client;
    protected readonly VeriFincaWebFactory _factory;

    protected IntegrationTestBase(VeriFincaWebFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    protected async Task<(string Token, Guid UserId)> RegisterAndLoginAsync(string planTier)
    {
        var registerResponse = await _client.PostAsJsonAsync("/api/auth/register", new
        {
            nombre = "Test",
            apellido = "User",
            email = "test$([Guid]::NewGuid())@example.com",
            password = "Password123!",
            telefono = "8091234567",
            cedula = "00100000009"
        });

        if (!registerResponse.IsSuccessStatusCode) { var regBody = await registerResponse.Content.ReadAsStringAsync(); throw new Exception("Register failed: " + regBody); }
        var registerData = await registerResponse.Content.ReadFromJsonAsync<RegisterUserResultDto>();

        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        
        var user = await db.Set<Usuario>().FindAsync(registerData!.UsuarioId);
        
        var plan = await db.Set<PlanSuscripcion>().FirstOrDefaultAsync(p => p.NombrePlan == planTier);
        if (plan == null)
        {
            var maxConsultas = planTier == "Enterprise" ? -1 : (planTier == "Consultor" ? 5 : 1);
            var maxProyectos = planTier == "Enterprise" ? -1 : (planTier == "Consultor" ? 1 : 0);
            plan = PlanSuscripcion.Create(
                Guid.NewGuid(), planTier, 100m,
                maxConsultas, maxProyectos,
                false, false,
                0, 100,
                false, false, false, false, false, false,
                "Comunidad", false);
            db.Set<PlanSuscripcion>().Add(plan);
            await db.SaveChangesAsync();
        }

        if (user == null) throw new Exception($"User with id {registerData.UsuarioId} not found");

        user.AsignarPlan(plan.Idsuscripcion);
        var verificado = user.VerificarEmail(user.TokenVerificacion!);
        if (!verificado) throw new Exception($"Failed to verify email. Token: {user.TokenVerificacion}");
        await db.SaveChangesAsync();

        var loginResponse = await _client.PostAsJsonAsync("/api/auth/login", new
        {
            email = user!.Email,
            password = "Password123!"
        });
        
        var loginBody = await loginResponse.Content.ReadAsStringAsync();
        if (!loginResponse.IsSuccessStatusCode) { throw new Exception("Login failed: " + loginBody); }

        using var doc = JsonDocument.Parse(loginBody);
        var token = doc.RootElement.GetProperty("accessToken").GetString()!;

        return (token, registerData!.UsuarioId.GetValueOrDefault());
    }
}
