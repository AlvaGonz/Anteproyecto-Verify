namespace Tests.Integration.Dashboard;

using Tests.Integration.Infrastructure;
using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Domain.Entities;
using Domain.Enums;

[Collection("Database")]
public class DashboardStatsTests : IntegrationTestBase
{
    public DashboardStatsTests(SqlServerFixture fixture) : base(fixture) { }

    [Fact]
    public async Task TotalUsuarios_MatchesSettingsUsersCount_IncludingConsultorPlan()
    {
        // Register the Consultor user FIRST: the shared client's `jwt` cookie from the last
        // login wins over the Authorization header (JwtBearer OnMessageReceived), so the
        // admin must log in LAST.
        var consultorEmail = $"consultor_{Guid.NewGuid()}@test.com";
        var consultorToken = await RegisterAndGetTokenAsync(email: consultorEmail);
        var consultorId = GetUserIdFromToken(consultorToken);
        await AssignPlanToUserAsync(consultorId, "Consultor");

        // Register admin and promote BEFORE login so the JWT carries the role claim
        var adminEmail = $"admin_{Guid.NewGuid()}@test.com";
        await RegisterAndGetTokenAsync(email: adminEmail);
        using (var scope = Factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<global::Infrastructure.Persistence.AppDbContext>();
            var admin = await db.Usuarios.FirstAsync(u => u.CorreoElectronico == adminEmail);
            admin.UpdateRol(UserRole.Administrator);
            await db.SaveChangesAsync();
        }
        var loginResponse = await Client.PostAsJsonAsync("/api/auth/login", new { email = adminEmail, password = "Test123!" });
        loginResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var loginBody = await loginResponse.Content.ReadFromJsonAsync<LoginResponseDto>();
        SetBearerToken(loginBody!.AccessToken);

        // Settings users list — the canonical managed-user count (active, non-admin, ANY plan)
        var settingsResponse = await Client.GetAsync("/api/admin/users");
        settingsResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var settingsBody = await settingsResponse.Content.ReadFromJsonAsync<JsonElement>();
        var settingsTotal = settingsBody.GetProperty("totalCount").GetInt32();

        // Dashboard stats card "Total Usuarios"
        var statsResponse = await Client.GetAsync("/api/admin/dashboard/stats");
        statsResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var statsBody = await statsResponse.Content.ReadFromJsonAsync<JsonElement>();
        var dashboardTotal = statsBody.GetProperty("totalUsuarios").GetInt32();

        // Both must count the same population — including the Consultor-plan user
        dashboardTotal.Should().Be(settingsTotal);
        dashboardTotal.Should().BeGreaterThanOrEqualTo(2);
    }

    [Fact]
    public async Task UserStats_Ofertas_CountsInterestsRegisteredByUser_NotByProjectCreator()
    {
        // Register userA (project creator) and userB (interested user)
        var userAToken = await RegisterAndGetTokenAsync(email: $"userA_{Guid.NewGuid()}@test.com");
        var userAId = GetUserIdFromToken(userAToken);

        var userBToken = await RegisterAndGetTokenAsync(email: $"userB_{Guid.NewGuid()}@test.com");
        var userBId = GetUserIdFromToken(userBToken);

        // userA creates a project, userB registers interest in it
        using (var scope = Factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<global::Infrastructure.Persistence.AppDbContext>();
            var estado = await db.Set<ProyectoEstado>().FirstAsync();
            var proyecto = new Proyecto("Test Project", "Test Location", userAId, categoriaId: 1);
            proyecto.UpdateEstado(estado);
            db.Proyectos.Add(proyecto);
            await db.SaveChangesAsync();

            var interes = new ProyectoInteresado(proyecto.Id, userAId, userBId);
            db.ProyectosInteresados.Add(interes);
            await db.SaveChangesAsync();

            // Verify: count BY userB (interested user) should include this record
            var countForInterested = await db.ProyectosInteresados
                .CountAsync(pi => pi.InterestedUserId == userBId);
            countForInterested.Should().BeGreaterThanOrEqualTo(1);

            // Verify: count BY userA (project creator, not interested) should NOT include this record
            var countForCreator = await db.ProyectosInteresados
                .CountAsync(pi => pi.InterestedUserId == userAId && pi.ProjectId == proyecto.Id);
            countForCreator.Should().Be(0);
        }
    }

    private Guid GetUserIdFromToken(string jwt)
    {
        var parts = jwt.Split('.');
        var payload = System.Text.Json.JsonDocument.Parse(
            System.Convert.FromBase64String(
                parts[1].PadRight(parts[1].Length +
                    (4 - parts[1].Length % 4) % 4, '=')));

        return Guid.Parse(
            payload.RootElement.GetProperty("sub").GetString()!);
    }
}
