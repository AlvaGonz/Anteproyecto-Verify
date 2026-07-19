using System;
using System.Threading;
using System.Threading.Tasks;
using Domain.Entities;
using Domain.Enums;
using Domain.Policies;
using Microsoft.EntityFrameworkCore;
using global::Application.Features.Subscriptions.Queries.GetMySubscriptionStatus;
using Infrastructure.Persistence;
using Infrastructure.Persistence.Repositories;
using Xunit;

namespace Tests.Unit.Subscriptions;

public class GetMySubscriptionStatusQueryHandlerTests
{
    private static AppDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new AppDbContext(options);
    }

    private static PlanSuscripcion CreateProfesionalPlan(AppDbContext db)
    {
        var plan = PlanSuscripcion.Create(
            Guid.NewGuid(), "Profesional", 3500m,
            25, 5, true, true, 0, 200, false, false, false, false, true, false, "Email", false);
        db.PlanesSuscripcion.Add(plan);
        db.SaveChanges();
        return plan;
    }

    private static PlanSuscripcion CreateConsultorPlan(AppDbContext db)
    {
        var plan = PlanSuscripcion.Create(
            Guid.NewGuid(), "Consultor", 0m,
            1, 1, false, false, 0, 0, false, false, false, false, false, false, "Comunidad", false);
        db.PlanesSuscripcion.Add(plan);
        db.SaveChanges();
        return plan;
    }

    private static PlanSuscripcion CreateCorporativoPlan(AppDbContext db)
    {
        var plan = PlanSuscripcion.Create(
            Guid.NewGuid(), "Corporativo", 30000m,
            -1, 50, true, true, -1, 10240, true, true, true, true, true, true, "Account Manager", true);
        db.PlanesSuscripcion.Add(plan);
        db.SaveChanges();
        return plan;
    }

    private static Usuario CreateUser(AppDbContext db, PlanSuscripcion plan, bool activeSubscription = true)
    {
        var user = new Usuario("Test", "User", $"{Guid.NewGuid()}@test.com", "hashedpw", UserRole.User, "8091234567", "001-0000001-1");
        user.AsignarPlan(plan.Idsuscripcion);
        if (activeSubscription)
        {
            user.UpdateStripeSubscription("sub_test", "active", DateTime.UtcNow.AddMonths(1));
        }
        
        // Use reflection to set navigation property
        typeof(Usuario)
            .GetProperty(nameof(Usuario.Plan))!
            .SetValue(user, plan);
        
        db.Usuarios.Add(user);
        db.SaveChanges();
        return user;
    }

    private static global::Application.Features.Subscriptions.Queries.GetMySubscriptionStatus.IUserSubscriptionReadRepository CreateRepository(AppDbContext db)
    {
        return new UsuarioRepository(db);
    }

    [Fact]
    public async Task HandleAsync_UserWithProfesionalPlan_ReturnsAllPlanLimitsFromDatabase()
    {
        // Arrange
        using var db = CreateDbContext();
        var plan = CreateProfesionalPlan(db);
        var user = CreateUser(db, plan, activeSubscription: true);
        
        var repository = CreateRepository(db);
        var handler = new GetMySubscriptionStatusQueryHandler(repository);

        // Act
        var result = await handler.HandleAsync(user.Id, CancellationToken.None);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Profesional", result.Plan);
        Assert.Equal(3500m, result.PlanPrice);
        Assert.Equal("active", result.SubscriptionStatus);
        Assert.NotNull(result.PlanLimits);
        
        var limits = result.PlanLimits!;
        Assert.Equal(25, limits.MaxConsultas);
        Assert.Equal(5, limits.MaxProyectos);
        Assert.True(limits.PresentacionPublica);
        Assert.True(limits.QrIncluido);
        Assert.Equal(0, limits.MaxUsuariosSecundarios);
        Assert.Equal(200, limits.MaxAlmacenamientoMb);
        Assert.False(limits.AlertasTiempoReal);
        Assert.False(limits.ModeloLm);
        Assert.False(limits.ValidacionLote);
        Assert.False(limits.ExportacionExcel);
        Assert.True(limits.ExportacionPdf);
        Assert.False(limits.IntegracionCrm);
        Assert.Equal("Email", limits.SoporteTipo);
        Assert.False(limits.AccesoApi);
        Assert.Equal(0, limits.ConsultasUsadas);
        Assert.Equal(0, limits.ProyectosCreados);
    }

    [Fact]
    public async Task HandleAsync_UserWithConsultorPlan_ReturnsFreePlanLimits()
    {
        // Arrange
        using var db = CreateDbContext();
        var plan = CreateConsultorPlan(db);
        var user = CreateUser(db, plan, activeSubscription: false); // Free plan doesn't need active status
        
        var repository = CreateRepository(db);
        var handler = new GetMySubscriptionStatusQueryHandler(repository);

        // Act
        var result = await handler.HandleAsync(user.Id, CancellationToken.None);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Consultor", result.Plan);
        Assert.Equal(0m, result.PlanPrice);
        Assert.Equal("free", result.SubscriptionStatus); // Free plan maps to "free" status
        Assert.NotNull(result.PlanLimits);
        
        var limits = result.PlanLimits!;
        Assert.Equal(1, limits.MaxConsultas);
        Assert.Equal(1, limits.MaxProyectos);
        Assert.False(limits.PresentacionPublica);
        Assert.False(limits.QrIncluido);
        Assert.Equal(0, limits.MaxUsuariosSecundarios);
        Assert.Equal(0, limits.MaxAlmacenamientoMb);
        Assert.False(limits.AlertasTiempoReal);
        Assert.False(limits.ModeloLm);
        Assert.False(limits.ValidacionLote);
        Assert.False(limits.ExportacionExcel);
        Assert.False(limits.ExportacionPdf);
        Assert.False(limits.IntegracionCrm);
        Assert.Equal("Comunidad", limits.SoporteTipo);
        Assert.False(limits.AccesoApi);
    }

    [Fact]
    public async Task HandleAsync_UserWithCorporativoPlan_ReturnsUnlimitedLimits()
    {
        // Arrange
        using var db = CreateDbContext();
        var plan = CreateCorporativoPlan(db);
        var user = CreateUser(db, plan, activeSubscription: true);
        
        var repository = CreateRepository(db);
        var handler = new GetMySubscriptionStatusQueryHandler(repository);

        // Act
        var result = await handler.HandleAsync(user.Id, CancellationToken.None);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Corporativo", result.Plan);
        Assert.NotNull(result.PlanLimits);
        
        var limits = result.PlanLimits!;
        Assert.Equal(-1, limits.MaxConsultas); // Unlimited
        Assert.Equal(50, limits.MaxProyectos);
        Assert.True(limits.PresentacionPublica);
        Assert.True(limits.QrIncluido);
        Assert.Equal(-1, limits.MaxUsuariosSecundarios);
        Assert.Equal(10240, limits.MaxAlmacenamientoMb);
        Assert.True(limits.AlertasTiempoReal);
        Assert.True(limits.ModeloLm);
        Assert.True(limits.ValidacionLote);
        Assert.True(limits.ExportacionExcel);
        Assert.True(limits.ExportacionPdf);
        Assert.True(limits.IntegracionCrm);
        Assert.Equal("Account Manager", limits.SoporteTipo);
        Assert.True(limits.AccesoApi);
    }

    [Fact]
    public async Task HandleAsync_GuestUser_ReturnsTitularPlanLimits()
    {
        // Arrange
        using var db = CreateDbContext();
        var titularPlan = CreateCorporativoPlan(db);
        var titular = CreateUser(db, titularPlan, activeSubscription: true);
        
        var guestPlan = CreateConsultorPlan(db);
        var guest = new Usuario("Guest", "User", $"{Guid.NewGuid()}@test.com", "hashedpw", UserRole.User, "8091234567", "001-0000002-1");
        guest.AsignarPlan(guestPlan.Idsuscripcion);
        guest.AsignarTitular(titular.Id);
        
        // Set titular navigation
        typeof(Usuario).GetProperty(nameof(Usuario.Titular))!.SetValue(guest, titular);
        typeof(Usuario).GetProperty(nameof(Usuario.Plan))!.SetValue(guest, guestPlan);
        
        db.Usuarios.Add(guest);
        db.SaveChanges();
        
        var repository = CreateRepository(db);
        var handler = new GetMySubscriptionStatusQueryHandler(repository);

        // Act
        var result = await handler.HandleAsync(guest.Id, CancellationToken.None);

        // Assert
        Assert.NotNull(result);
        Assert.True(result.IsGuest);
        Assert.Equal("Corporativo", result.InviterPlan);
        Assert.NotNull(result.PlanLimits);
        
        // Guest should get titular's plan limits
        var limits = result.PlanLimits!;
        Assert.Equal(-1, limits.MaxConsultas);
        Assert.Equal(50, limits.MaxProyectos);
        Assert.True(limits.PresentacionPublica);
        Assert.True(limits.AccesoApi);
    }

    [Fact]
    public async Task HandleAsync_UserWithNoPlan_ReturnsNullPlanLimits()
    {
        // Arrange
        using var db = CreateDbContext();
        var user = new Usuario("Test", "User", $"{Guid.NewGuid()}@test.com", "hashedpw", UserRole.User, "8091234567", "001-0000001-1");
        // No plan assigned
        
        db.Usuarios.Add(user);
        db.SaveChanges();
        
        var repository = CreateRepository(db);
        var handler = new GetMySubscriptionStatusQueryHandler(repository);

        // Act
        var result = await handler.HandleAsync(user.Id, CancellationToken.None);

        // Assert
        Assert.NotNull(result);
        Assert.Null(result.Plan);
        Assert.Null(result.PlanLimits);
    }

    [Fact]
    public async Task HandleAsync_UserWithActiveSubscriptionButCancelledAtPeriodEnd_ReturnsCancelingStatus()
    {
        // Arrange
        using var db = CreateDbContext();
        var plan = CreateProfesionalPlan(db);
        var user = CreateUser(db, plan, activeSubscription: true);
        
        // Set cancellation scheduled
        user.SetCancellationScheduled(DateTime.UtcNow.AddDays(10));
        db.SaveChanges();
        
        var repository = CreateRepository(db);
        var handler = new GetMySubscriptionStatusQueryHandler(repository);

        // Act
        var result = await handler.HandleAsync(user.Id, CancellationToken.None);

        // Assert
        Assert.Equal("canceling", result.SubscriptionStatus);
        Assert.True(result.CancelAtPeriodEnd);
    }

    [Fact]
    public async Task HandleAsync_IncludesUsageCountersFromUser()
    {
        // Arrange
        using var db = CreateDbContext();
        var plan = CreateProfesionalPlan(db);
        var user = CreateUser(db, plan, activeSubscription: true);
        
        // Set usage via reflection
        typeof(Usuario).GetProperty(nameof(Usuario.ConsultasUsadas))!.SetValue(user, 10);
        typeof(Usuario).GetProperty(nameof(Usuario.ProyectosCreados))!.SetValue(user, 3);
        db.SaveChanges();
        
        var repository = CreateRepository(db);
        var handler = new GetMySubscriptionStatusQueryHandler(repository);

        // Act
        var result = await handler.HandleAsync(user.Id, CancellationToken.None);

        // Assert
        Assert.NotNull(result.PlanLimits);
        Assert.Equal(10, result.PlanLimits!.ConsultasUsadas);
        Assert.Equal(3, result.PlanLimits!.ProyectosCreados);
    }
}