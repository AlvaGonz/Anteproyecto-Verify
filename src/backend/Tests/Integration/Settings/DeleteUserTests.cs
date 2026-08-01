namespace Tests.Integration.Settings;

using Tests.Integration.Infrastructure;
using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Domain.Entities;
using Domain.Enums;

[Collection("Database")]
public class DeleteUserTests : IntegrationTestBase
{
    public DeleteUserTests(SqlServerFixture fixture) : base(fixture) { }

    [Fact]
    public async Task DELETE_User_WithSessions2FaInvitationsAndLogs_RemovesEverything()
    {
        var victimEmail = $"victim_{Guid.NewGuid()}@test.com";
        var adminEmail = $"admin_{Guid.NewGuid()}@test.com";

        // Register + verify victim (login also creates a session row for the victim)
        await RegisterAndGetTokenAsync(email: victimEmail);

        // Register admin and promote to Administrator BEFORE login so the
        // JWT carries the "admin" role claim (IsAdminAsync depends on it)
        await RegisterAndGetTokenAsync(email: adminEmail);
        Guid adminId;
        using (var scope = Factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<global::Infrastructure.Persistence.AppDbContext>();
            var admin = await db.Usuarios.FirstAsync(u => u.CorreoElectronico == adminEmail);
            admin.UpdateRol(UserRole.Administrator);
            await db.SaveChangesAsync();
            adminId = admin.Id;
        }

        var loginResponse = await Client.PostAsJsonAsync("/api/auth/login", new { email = adminEmail, password = "Test123!" });
        loginResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var loginBody = await loginResponse.Content.ReadFromJsonAsync<LoginResponseDto>();
        SetBearerToken(loginBody!.AccessToken);

        // Seed every FK child that historically blocked user deletion
        Guid victimId;
        using (var scope = Factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<global::Infrastructure.Persistence.AppDbContext>();
            victimId = (await db.Usuarios.FirstAsync(u => u.CorreoElectronico == victimEmail)).Id;

            db.SesionesUsuario.Add(new SesionUsuario(victimId, "rt-" + Guid.NewGuid().ToString("N"), DateTime.UtcNow.AddDays(7)));
            db.Verificaciones2FA.Add(new Verificacion2FA(victimId, "sess-1", "123456"));
            db.Invitaciones.Add(new Invitacion(victimId, "invitee@test.com", "Invitado", "Uno", "8090000000", "001-1234567-3"));
            db.LogConsultas.Add(new LogConsulta(victimId, true, "test"));

            var estado = await db.ProyectoEstados.FirstAsync();
            var proyecto = new Proyecto("Proyecto Test", "Santo Domingo", adminId, ProjectCategory.Residencial, null, "DC-123");
            proyecto.UpdateEstado(estado.Id);
            db.Proyectos.Add(proyecto);
            await db.SaveChangesAsync();

            db.LogProyectos.Add(new LogProyecto(victimId, proyecto.Id, "test"));
            db.ProyectosGuardados.Add(new ProyectoGuardado(proyecto.Id, adminId, victimId));
            db.ProyectosInteresados.Add(new ProyectoInteresado(proyecto.Id, adminId, victimId));
            await db.SaveChangesAsync();
        }

        var response = await Client.DeleteAsync($"/api/admin/users/{victimId}");

        response.StatusCode.Should().Be(HttpStatusCode.OK);

        using var verifyScope = Factory.Services.CreateScope();
        var verifyDb = verifyScope.ServiceProvider.GetRequiredService<global::Infrastructure.Persistence.AppDbContext>();
        verifyDb.Usuarios.Any(u => u.Id == victimId).Should().BeFalse();
        verifyDb.SesionesUsuario.Any(s => s.UsuarioId == victimId).Should().BeFalse();
        verifyDb.Verificaciones2FA.Any(v => v.UsuarioId == victimId).Should().BeFalse();
        verifyDb.Invitaciones.Any(i => i.EmisorId == victimId).Should().BeFalse();
        verifyDb.LogConsultas.Any(l => l.UsuarioId == victimId).Should().BeFalse();
        verifyDb.LogProyectos.Any(l => l.UsuarioId == victimId).Should().BeFalse();
        verifyDb.ProyectosGuardados.Any(p => p.SaverId == victimId || p.CreatorId == victimId).Should().BeFalse();
        verifyDb.ProyectosInteresados.Any(p => p.InterestedUserId == victimId || p.CreatorId == victimId).Should().BeFalse();
    }
}
