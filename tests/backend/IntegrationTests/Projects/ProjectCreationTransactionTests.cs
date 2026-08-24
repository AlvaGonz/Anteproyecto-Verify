namespace Tests.Integration.Projects;

using System;
using System.Linq;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Threading;
using System.Threading.Tasks;
using Xunit;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using Tests.Integration.Helpers;
using Application.DTOs;
using Application.Features.Projects;
using Infrastructure.Persistence;
using Domain.Entities;
using Domain.Enums;

public class ProjectCreationTransactionTests : IntegrationTestBase
{
    public ProjectCreationTransactionTests(VeriFincaWebFactory factory) : base(factory)
    {
    }

    [Fact]
    public async Task CreateProject_Success_PersistsProjectAndAuditAtomically()
    {
        // 1. Arrange - Register and Login
        var (token, userId) = await RegisterAndLoginAsync("Corporativo");
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        int categoriaId = 16;
        using (var setupScope = _factory.Services.CreateScope())
        {
            var setupDb = setupScope.ServiceProvider.GetRequiredService<AppDbContext>();
            var cat = await setupDb.Set<CategoriaProyecto>().FirstOrDefaultAsync(c => c.Activo);
            if (cat == null)
            {
                cat = new CategoriaProyecto { Id = 16, Nombre = "COMERCIAL", Activo = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
                setupDb.Set<CategoriaProyecto>().Add(cat);
                await setupDb.SaveChangesAsync();
            }
            categoriaId = cat.Id;

            var est = await setupDb.Set<ProyectoEstado>().FirstOrDefaultAsync(e => e.CodigoUnico == ProjectStatusCodes.Creado);
            if (est == null)
            {
                est = new ProyectoEstado(ProjectStatusCodes.Creado, "Creado", "Desc", "Cond", "#000000");
                setupDb.Set<ProyectoEstado>().Add(est);
                await setupDb.SaveChangesAsync();
            }
        }

        var projectName = $"Atomic Int Test {Guid.NewGuid():N}";

        // 2. Act - Create project via ProjectService against real SQL Server
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var projectService = scope.ServiceProvider.GetRequiredService<Application.Contracts.Projects.IProjectService>();

        var dto = new CreateProyectoDto(
            projectName,
            "Santo Domingo, RD",
            userId,
            categoriaId,
            "Desarrolladora SRL",
            null,
            $"DC-{Guid.NewGuid():N}".Substring(0, 10),
            null,
            $"MAT-{Guid.NewGuid():N}".Substring(0, 10),
            "Propietario Test",
            "40200000000"
        );

        var projectDto = await projectService.CreateProjectAsync(dto);
        Assert.NotNull(projectDto);
        var createdProjectId = projectDto.Id;

        // 3. Assert in live SQL Server database
        using var verifyScope = _factory.Services.CreateScope();
        var verifyDb = verifyScope.ServiceProvider.GetRequiredService<AppDbContext>();

        var persistedProject = await verifyDb.Proyectos.AsNoTracking().FirstOrDefaultAsync(p => p.Id == createdProjectId);
        Assert.NotNull(persistedProject);
        Assert.Equal(projectName, persistedProject.Nombre);

        var persistedAudits = await verifyDb.Auditorias.AsNoTracking()
            .Where(a => a.ReferenciaExpedienteId == createdProjectId)
            .ToListAsync();

        Assert.NotEmpty(persistedAudits);
        var creationAudit = persistedAudits.FirstOrDefault(a => a.Accion == "Creación");
        Assert.NotNull(creationAudit);
        Assert.Equal(userId, creationAudit.UsuarioId);
        Assert.Equal(persistedProject.EstadoId, creationAudit.EstadoNuevoId);
    }

    [Fact]
    public async Task CreateProject_CancellationBeforeCommit_DoesNotPersistPartialState()
    {
        // 1. Arrange - Resolve scoped services
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var projectService = scope.ServiceProvider.GetRequiredService<Application.Contracts.Projects.IProjectService>();

        var user = new Usuario("Cancel", "Test", $"cancel_{Guid.NewGuid():N}@test.com", "hash", UserRole.User, "123456", "40200000000");
        var plan = await db.Set<PlanSuscripcion>().FirstOrDefaultAsync(p => p.NombrePlan == "Corporativo");
        if (plan == null)
        {
            plan = PlanSuscripcion.Create(Guid.NewGuid(), "Corporativo", 100m, -1, -1, false, false, 0, 100, false, false, false, false, false, false, "Comunidad", false);
            db.Set<PlanSuscripcion>().Add(plan);
            await db.SaveChangesAsync();
        }
        user.AsignarPlan(plan.Idsuscripcion);
        user.UpdateStripeSubscription(null, null, "active", DateTime.UtcNow.AddYears(1));
        user.VerificarEmail(user.TokenVerificacion ?? "tok");
        db.Set<Usuario>().Add(user);
        await db.SaveChangesAsync();

        var projectName = $"Cancelled Project {Guid.NewGuid():N}";
        var dto = new CreateProyectoDto(
            projectName,
            "Ubicacion Test",
            user.Id,
            16,
            "Dev Test",
            null,
            $"DC-{Guid.NewGuid():N}".Substring(0, 10),
            null,
            $"MAT-{Guid.NewGuid():N}".Substring(0, 10)
        );

        using var cts = new CancellationTokenSource();
        cts.Cancel(); // Pre-cancelled token

        // 2. Act & Assert
        await Assert.ThrowsAnyAsync<OperationCanceledException>(() => projectService.CreateProjectAsync(dto, cts.Token));

        // 3. Verify no project or audit rows were left behind
        using var verifyScope = _factory.Services.CreateScope();
        var verifyDb = verifyScope.ServiceProvider.GetRequiredService<AppDbContext>();

        var orphanProject = await verifyDb.Proyectos.AsNoTracking().FirstOrDefaultAsync(p => p.Nombre == projectName);
        Assert.Null(orphanProject);

        var orphanAudits = await verifyDb.Auditorias.AsNoTracking().Where(a => a.UsuarioId == user.Id).ToListAsync();
        Assert.Empty(orphanAudits);
    }

    [Fact]
    public async Task CreateProject_WhenDbSaveFails_RollsBackBothProjectAndAudit()
    {
        // 1. Arrange
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var projectService = scope.ServiceProvider.GetRequiredService<Application.Contracts.Projects.IProjectService>();

        var user = new Usuario("DbFail", "Test", $"dbfail_{Guid.NewGuid():N}@test.com", "hash", UserRole.User, "123456", "40200000000");
        var plan = await db.Set<PlanSuscripcion>().FirstOrDefaultAsync(p => p.NombrePlan == "Corporativo");
        if (plan == null)
        {
            plan = PlanSuscripcion.Create(Guid.NewGuid(), "Corporativo", 100m, -1, -1, false, false, 0, 100, false, false, false, false, false, false, "Comunidad", false);
            db.Set<PlanSuscripcion>().Add(plan);
            await db.SaveChangesAsync();
        }
        user.AsignarPlan(plan.Idsuscripcion);
        user.UpdateStripeSubscription(null, null, "active", DateTime.UtcNow.AddYears(1));
        user.VerificarEmail(user.TokenVerificacion ?? "tok");
        db.Set<Usuario>().Add(user);
        await db.SaveChangesAsync();

        var cat = await db.Set<CategoriaProyecto>().FirstOrDefaultAsync(c => c.Activo);
        if (cat == null)
        {
            cat = new CategoriaProyecto { Id = 16, Nombre = "COMERCIAL", Activo = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
            db.Set<CategoriaProyecto>().Add(cat);
            await db.SaveChangesAsync();
        }

        var projectName = $"Fail Project {Guid.NewGuid():N}";
        // Pass a non-existent ProvinciaId that causes a database FK constraint error if validation is bypassed
        var nonExistentProvinciaId = Guid.NewGuid();
        var dto = new CreateProyectoDto(
            projectName,
            "Ubicacion Test",
            user.Id,
            cat.Id,
            "Dev Test",
            null,
            $"DC-{Guid.NewGuid():N}".Substring(0, 10),
            null,
            $"MAT-{Guid.NewGuid():N}".Substring(0, 10),
            "Propietario Test",
            "40200000000",
            ProvinciaId: nonExistentProvinciaId
        );

        // 2. Act & Assert - Expect argument or db failure
        await Assert.ThrowsAnyAsync<Exception>(() => projectService.CreateProjectAsync(dto));

        // 3. Assert - In live SQL Server, neither project nor audit exists
        using var verifyScope = _factory.Services.CreateScope();
        var verifyDb = verifyScope.ServiceProvider.GetRequiredService<AppDbContext>();

        var orphanProject = await verifyDb.Proyectos.AsNoTracking().FirstOrDefaultAsync(p => p.Nombre == projectName);
        Assert.Null(orphanProject);

        var orphanAudits = await verifyDb.Auditorias.AsNoTracking().Where(a => a.UsuarioId == user.Id).ToListAsync();
        Assert.Empty(orphanAudits);
    }
}
