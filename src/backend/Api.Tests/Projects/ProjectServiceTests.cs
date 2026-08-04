using System;
using System.Collections.Generic;
using System.Reflection;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Notifications;
using Application.Abstractions.Persistence;
using Application.Common.Exceptions;
using Application.DTOs;
using Application.Features.Projects;
using Domain.Entities;
using Domain.Enums;
using NSubstitute;
using Xunit;

namespace Api.Tests.Projects;

public class ProjectServiceTests
{
    private readonly IProyectoRepository _proyectoRepoMock;
    private readonly IUsuarioRepository _usuarioRepoMock;
    private readonly IEmailNotificationService _emailServiceMock;
    private readonly IUnitOfWork _uowMock;
    private readonly ProjectService _service;

    public ProjectServiceTests()
    {
        _proyectoRepoMock = Substitute.For<IProyectoRepository>();
        _usuarioRepoMock = Substitute.For<IUsuarioRepository>();
        _emailServiceMock = Substitute.For<IEmailNotificationService>();
        _uowMock = Substitute.For<IUnitOfWork>();

        _service = new ProjectService(
            _proyectoRepoMock,
            _usuarioRepoMock,
            _emailServiceMock,
            _uowMock,
            Substitute.For<global::Application.Abstractions.IAuditLogger>()
        );
    }

    private void SetPrivateProperty(object instance, string propertyName, object value)
    {
        var prop = instance.GetType().GetProperty(propertyName, BindingFlags.Public | BindingFlags.NonPublic | BindingFlags.Instance);
        prop?.SetValue(instance, value);
    }

    [Fact]
    public async Task CreateProject_ValidInput_CreatesProjectAndSaves()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var user = new Usuario("Test", "User", "test@example.com", "123", UserRole.User, "001", "hash");
        SetPrivateProperty(user, "Id", userId);

        var premiumPlanId = Guid.NewGuid();
        var premiumPlan = PlanSuscripcion.Create(premiumPlanId, "Premium", 100, -1, 100, true, true, 10, 1024, true, true, true, true, true, true, "Premium", true);
        user.AsignarPlan(premiumPlanId);
        SetPrivateProperty(user, "Plan", premiumPlan);
        user.UpdateStripeSubscription("customer123", "sub123", "active", DateTime.UtcNow.AddMonths(1));

        _usuarioRepoMock.GetByIdWithPlanAsync(userId, Arg.Any<CancellationToken>()).Returns(user);
        _proyectoRepoMock.CountByUsuarioAsync(userId, Arg.Any<CancellationToken>()).Returns(1);
        _proyectoRepoMock.GetCategoriasAsync(Arg.Any<CancellationToken>())
            .Returns(new[] { new CategoriaProyecto { Id = 2, Nombre = "ALMACENES", Activo = true } });
        _proyectoRepoMock.GetEstadoByStatusAsync(ProjectStatus.Creado, Arg.Any<CancellationToken>())
            .Returns(new ProyectoEstado(ProjectStatusCodes.Creado, "Creado", "Desc", "Cond", "#000000"));

        var dto = new CreateProyectoDto(
            "New Project",
            "Location",
            userId,
            2,
            "DevData",
            "RNC-123",
            "CAT-123",
            "GPS-123",
            "MAT-123"
        );

        // Act
        var result = await _service.CreateProjectAsync(dto, CancellationToken.None);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("New Project", result.Nombre);
        Assert.Equal("Location", result.UbicacionTexto);
        Assert.Equal(userId, result.UsuarioCreadorId);
        
        await _proyectoRepoMock.Received(1).AddAsync(Arg.Is<Proyecto>(p => 
            p.Nombre == "New Project" && 
            p.CategoriaId == 2 &&
            p.UbicacionGps == "GPS-123" &&
            p.RncDesarrollador == "RNC-123"
        ), Arg.Any<CancellationToken>());
        await _uowMock.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CreateProject_UserNotFound_ThrowsKeyNotFoundException()
    {
        // Arrange
        var userId = Guid.NewGuid();
        _usuarioRepoMock.GetByIdWithPlanAsync(userId, Arg.Any<CancellationToken>()).Returns((Usuario?)null);

        var dto = new CreateProyectoDto("Test", "Location", userId, 1, null, null, null, null, null);

        // Act & Assert
        var ex = await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.CreateProjectAsync(dto, CancellationToken.None));
        Assert.Contains(userId.ToString(), ex.Message);
        
        await _proyectoRepoMock.DidNotReceive().AddAsync(Arg.Any<Proyecto>(), Arg.Any<CancellationToken>());
        await _uowMock.DidNotReceive().SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CreateProject_QuotaExceeded_ThrowsQuotaExceededException()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var user = new Usuario("Test", "User", "test@example.com", "123", UserRole.User, "001", "hash");
        SetPrivateProperty(user, "Id", userId);

        var basicPlanId = Guid.NewGuid();
        var basicPlan = PlanSuscripcion.Create(basicPlanId, "Basico", 0, 10, 3, false, false, 0, 0, false, false, false, false, false, false, "Comunidad", false);
        user.AsignarPlan(basicPlanId);
        SetPrivateProperty(user, "Plan", basicPlan);

        _usuarioRepoMock.GetByIdWithPlanAsync(userId, Arg.Any<CancellationToken>()).Returns(user);
        
        // Basic plan limit is 3, let's say they have 3
        _proyectoRepoMock.CountByUsuarioAsync(userId, Arg.Any<CancellationToken>()).Returns(3);

        var dto = new CreateProyectoDto("Test", "Location", userId, 1, null, null, null, null, null);

        // Act & Assert
        var ex = await Assert.ThrowsAsync<QuotaExceededException>(() => _service.CreateProjectAsync(dto, CancellationToken.None));
        Assert.Equal("Basico", ex.TierName);
        
        await _proyectoRepoMock.DidNotReceive().AddAsync(Arg.Any<Proyecto>(), Arg.Any<CancellationToken>());
        await _uowMock.DidNotReceive().SaveChangesAsync(Arg.Any<CancellationToken>());
    }
}
