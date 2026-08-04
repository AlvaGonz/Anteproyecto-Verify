namespace Tests.Integration.Settings;

using Tests.Integration.Infrastructure;
using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Domain.Enums;

[Collection("Database")]
public class UpdateUserPlanTests : IntegrationTestBase
{
    public UpdateUserPlanTests(SqlServerFixture fixture) : base(fixture) { }

    [Fact]
    public async Task PATCH_UserPlan_AssignsPlan_Succeeds()
    {
        // Victim FIRST: registering logs in and overwrites the Client's "jwt"
        // cookie, which JwtBearer OnMessageReceived prefers over the header.
        var victimEmail = $"victim_{Guid.NewGuid()}@test.com";
        await RegisterAndGetTokenAsync(email: victimEmail);
        Guid victimId;
        using (var scope = Factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<global::Infrastructure.Persistence.AppDbContext>();
            victimId = (await db.Usuarios.FirstAsync(u => u.CorreoElectronico == victimEmail)).Id;
        }

        // Admin: register, promote, login LAST so the Client's jwt cookie is the admin's
        var adminEmail = $"admin_{Guid.NewGuid()}@test.com";
        await RegisterAndGetTokenAsync(email: adminEmail);
        using (var scope = Factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<global::Infrastructure.Persistence.AppDbContext>();
            var admin = await db.Usuarios.FirstAsync(u => u.CorreoElectronico == adminEmail);
            admin.UpdateRol(UserRole.Administrator);
            await db.SaveChangesAsync();
        }
        var login = await Client.PostAsJsonAsync("/api/auth/login", new { email = adminEmail, password = "Test123!" });
        login.StatusCode.Should().Be(HttpStatusCode.OK);
        SetBearerToken((await login.Content.ReadFromJsonAsync<LoginResponseDto>())!.AccessToken);

        // Target plan
        Guid planId;
        using (var scope = Factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<global::Infrastructure.Persistence.AppDbContext>();
            planId = (await db.PlanesSuscripcion.FirstAsync(p => p.NombrePlan == "Profesional")).Idsuscripcion;
        }

        // The plan assignment must succeed without any dependency on legacy tables
        var response = await Client.PatchAsJsonAsync($"/api/admin/users/{victimId}/plan", new { planId });

        response.StatusCode.Should().Be(HttpStatusCode.OK);

        using var verifyScope = Factory.Services.CreateScope();
        var verifyDb = verifyScope.ServiceProvider.GetRequiredService<global::Infrastructure.Persistence.AppDbContext>();
        (await verifyDb.Usuarios.FirstAsync(u => u.Id == victimId)).PlanSuscripcionId.Should().Be(planId);
    }
}
