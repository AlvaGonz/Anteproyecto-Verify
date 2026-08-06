namespace UnitTests;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using global::Application.Abstractions.Persistence;
using global::Application.DTOs;
using global::Application.Features.Projects;
using Domain.Entities;
using Domain.Enums;
using Moq;
using Xunit;

using global::Application.Abstractions.Notifications;

public class ProjectServiceTests
{
    private readonly Mock<IProyectoRepository> _proyectoRepositoryMock;
    private readonly Mock<IUsuarioRepository> _usuarioRepositoryMock;
    private readonly Mock<IEmailNotificationService> _emailNotificationServiceMock;
    private readonly Mock<INotificationFactory> _notificationFactoryMock;
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly ProjectService _projectService;

    public ProjectServiceTests()
    {
        _proyectoRepositoryMock = new Mock<IProyectoRepository>();
        _usuarioRepositoryMock = new Mock<IUsuarioRepository>();
        _emailNotificationServiceMock = new Mock<IEmailNotificationService>();
        _notificationFactoryMock = new Mock<INotificationFactory>();
        _unitOfWorkMock = new Mock<IUnitOfWork>();
        _projectService = new ProjectService(
            _proyectoRepositoryMock.Object,
            _usuarioRepositoryMock.Object,
            _emailNotificationServiceMock.Object,
            _notificationFactoryMock.Object,
            new Mock<INotificacionRepository>().Object,
            _unitOfWorkMock.Object,
            new Mock<global::Application.Abstractions.IAuditLogger>().Object,
            new Mock<IReglaValidacionRepository>().Object);
    }

    [Fact]
    public async Task CreateProject_ShouldReturnDto_WhenValid()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var dto = new CreateProyectoDto("Test", "Location", userId, 8, "DevData", null, "DC-123");
        
        var plan = Tests.Shared.TestPlanFactory.Profesional();
        var user = new Usuario("Test", "User", "test@test.com", "hash", UserRole.User, "123456", "40200000000");
        user.GetType().GetProperty("Id")?.SetValue(user, userId);
        user.GetType().GetProperty("Plan")?.SetValue(user, plan);
        user.UpdateStripeSubscription("mock_sub", "active", DateTime.UtcNow.AddMonths(1));
        
        _usuarioRepositoryMock.Setup(r => r.GetByIdWithPlanAsync(userId, It.IsAny<CancellationToken>())).ReturnsAsync(user);
        var estadoCreado = new ProyectoEstado(ProjectStatusCodes.Creado, "Creado", "desc", "cond", "#9BACD8");
        _proyectoRepositoryMock.Setup(r => r.GetCategoriasAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<CategoriaProyecto>
            {
                new CategoriaProyecto { Id = 8, Nombre = "COMERCIAL Y OFICINAS", Activo = true },
            });
        _proyectoRepositoryMock.Setup(r => r.GetEstadoByStatusAsync(ProjectStatus.Creado, It.IsAny<CancellationToken>()))
            .ReturnsAsync(estadoCreado);
        _proyectoRepositoryMock.Setup(r => r.AddAsync(It.IsAny<Proyecto>(), It.IsAny<CancellationToken>())).Returns(Task.CompletedTask);
        _unitOfWorkMock.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);

        // Act
        var result = await _projectService.CreateProjectAsync(dto);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Test", result.Nombre);
        Assert.Equal("Location", result.UbicacionTexto);
        Assert.Equal(8, result.CategoriaId);
        Assert.Equal("COMERCIAL Y OFICINAS", result.CategoriaNombre);
        Assert.Equal("DevData", result.DatosDesarrollador);
        Assert.Equal("DC-123", result.DesignacionCatastral);
        Assert.Equal(ProjectStatusCodes.Creado, result.EstadoProyecto);
    }

    [Fact]
    public async Task UpdateProject_ShouldReturnDto_WhenValid()
    {
        // Arrange
        var id = Guid.NewGuid();
        var estadoCreado = new ProyectoEstado(ProjectStatusCodes.Creado, "Creado", "desc", "cond", "#9BACD8");
        var estadoEditado = new ProyectoEstado(ProjectStatusCodes.Editado, "Editado", "desc", "cond", "#F98513");
        var proyecto = new Proyecto("Old", "OldLoc", Guid.NewGuid(), 12);
        proyecto.UpdateEstado(estadoCreado);
        var dto = new UpdateProyectoDto("New", "NewLoc", null, 1000, 12, "NewDev", null, "NewDC", null, null, null, null, null, null);
        
        _proyectoRepositoryMock.Setup(r => r.GetByIdAsync(id, It.IsAny<CancellationToken>())).ReturnsAsync(proyecto);
        _proyectoRepositoryMock.Setup(r => r.GetCategoriasAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<CategoriaProyecto>
            {
                new CategoriaProyecto { Id = 12, Nombre = "HOSPEDAJE", Activo = true },
            });
        _proyectoRepositoryMock.Setup(r => r.GetEstadoByStatusAsync(ProjectStatus.Editado, It.IsAny<CancellationToken>()))
            .ReturnsAsync(estadoEditado);
        _unitOfWorkMock.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);

        // Act
        var result = await _projectService.UpdateProjectAsync(id, dto);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("New", result.Nombre);
        Assert.Equal("NewLoc", result.UbicacionTexto);
        Assert.Equal(1000, result.ValorEstimado);
        Assert.Equal(12, result.CategoriaId);
        Assert.Equal("HOSPEDAJE", result.CategoriaNombre);
        Assert.Equal("NewDev", result.DatosDesarrollador);
        Assert.Equal("NewDC", result.DesignacionCatastral);
        Assert.Equal(ProjectStatusCodes.Editado, result.EstadoProyecto);
        Assert.Equal(estadoEditado.Id, proyecto.EstadoId);
    }

    [Fact]
    public async Task UpdateProject_DoesNotDowngrade_WhenAlreadyInRevision()
    {
        var id = Guid.NewGuid();
        var estadoRevision = new ProyectoEstado(ProjectStatusCodes.Revision, "En RevisiÃ³n", "desc", "cond", "#EAB308");
        var proyecto = new Proyecto("Old", "OldLoc", Guid.NewGuid(), 12);
        proyecto.UpdateEstado(estadoRevision);
        var dto = new UpdateProyectoDto("New", "NewLoc", null, 1000, 12, "NewDev", null, "NewDC", null, null, null, null, null, null);

        _proyectoRepositoryMock.Setup(r => r.GetByIdAsync(id, It.IsAny<CancellationToken>())).ReturnsAsync(proyecto);
        _proyectoRepositoryMock.Setup(r => r.GetCategoriasAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<CategoriaProyecto>
            {
                new CategoriaProyecto { Id = 12, Nombre = "HOSPEDAJE", Activo = true },
            });
        _unitOfWorkMock.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);

        var result = await _projectService.UpdateProjectAsync(id, dto);

        Assert.Equal(ProjectStatusCodes.Revision, result.EstadoProyecto);
        _proyectoRepositoryMock.Verify(
            r => r.GetEstadoByStatusAsync(ProjectStatus.Editado, It.IsAny<CancellationToken>()),
            Times.Never);
    }

    [Fact]
    public async Task UpdateProject_ShouldThrowKeyNotFound_WhenNotFound()
    {
        // Arrange
        var id = Guid.NewGuid();
        var dto = new UpdateProyectoDto("New", "NewLoc", null, 1000, 12, "NewDev", null, "NewDC", null, null, null, null, null, null);
        
        _proyectoRepositoryMock.Setup(r => r.GetByIdAsync(id, It.IsAny<CancellationToken>())).ReturnsAsync((Proyecto?)null);

        // Act & Assert
        await Assert.ThrowsAsync<KeyNotFoundException>(() => _projectService.UpdateProjectAsync(id, dto));
    }

    [Fact]
    public async Task GetVisibleProjects_ShouldReturnOnlyVisible()
    {
        // Arrange
        var user = new Usuario("Test", "User", "test@test.com", "hash", UserRole.User, "123456", "40200000000");
        var p1 = new Proyecto("P1", "L1", user.Id, 16);

        var p2 = new Proyecto("P2", "L2", user.Id, 16);

        _proyectoRepositoryMock.Setup(r => r.GetVisibleAsync(1, 50, It.IsAny<CancellationToken>())).ReturnsAsync(new List<Proyecto> { p1, p2 });

        // Act
        var result = await _projectService.GetVisibleProjectsAsync();

        // Assert
        Assert.NotNull(result);
        Assert.Equal(2, result.Count());
    }

    [Fact]
    public async Task GetProjectById_ShouldReturnDto_WhenExists()
    {
        // Arrange
        var id = Guid.NewGuid();
        var proyecto = new Proyecto("P1", "L1", Guid.NewGuid(), 16);
        _proyectoRepositoryMock.Setup(r => r.GetByIdAsync(id, It.IsAny<CancellationToken>())).ReturnsAsync(proyecto);

        // Act
        var result = await _projectService.GetProjectByIdAsync(id);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("P1", result.Nombre);
    }

    [Fact]
    public async Task GetProjectById_ShouldReturnNull_WhenNotExists()
    {
        var id = Guid.NewGuid();
        _proyectoRepositoryMock.Setup(r => r.GetByIdAsync(id, It.IsAny<CancellationToken>())).ReturnsAsync((Proyecto?)null);
        var result = await _projectService.GetProjectByIdAsync(id);
        Assert.Null(result);
    }

    // ── RED: Provincia relation ──────────────────────────────────────────

    [Fact]
    public async Task CreateProject_WithProvinciaId_ShouldIncludeProvinciaIdInDto()
    {
        var userId = Guid.NewGuid();
        var provinciaId = Guid.NewGuid();
        var dto = new CreateProyectoDto("Test", "Location", userId, 8, "DevData", null, "DC-123", ProvinciaId: provinciaId);

        var plan = Tests.Shared.TestPlanFactory.Profesional();
        var user = new Usuario("Test", "User", "test@test.com", "hash", UserRole.User, "123456", "40200000000");
        user.GetType().GetProperty("Id")?.SetValue(user, userId);
        user.GetType().GetProperty("Plan")?.SetValue(user, plan);
        user.UpdateStripeSubscription("mock_sub", "active", DateTime.UtcNow.AddMonths(1));
        _usuarioRepositoryMock.Setup(r => r.GetByIdWithPlanAsync(userId, It.IsAny<CancellationToken>())).ReturnsAsync(user);
        _proyectoRepositoryMock.Setup(r => r.GetCategoriasAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<CategoriaProyecto> { new CategoriaProyecto { Id = 8, Nombre = "COMERCIAL Y OFICINAS", Activo = true } });
        _proyectoRepositoryMock.Setup(r => r.GetEstadoByStatusAsync(ProjectStatus.Creado, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ProyectoEstado(ProjectStatusCodes.Creado, "Creado", "desc", "cond", "#9BACD8"));
        _proyectoRepositoryMock.Setup(r => r.ExistsProvinciaAsync(provinciaId, It.IsAny<CancellationToken>())).ReturnsAsync(true);
        _proyectoRepositoryMock.Setup(r => r.AddAsync(It.IsAny<Proyecto>(), It.IsAny<CancellationToken>())).Returns(Task.CompletedTask);
        _unitOfWorkMock.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);

        var result = await _projectService.CreateProjectAsync(dto);

        Assert.NotNull(result);
        Assert.Equal(provinciaId, result.ProvinciaId);
    }

    [Fact]
    public async Task CreateProject_WithInvalidProvinciaId_ShouldThrow()
    {
        var userId = Guid.NewGuid();
        var invalidProvinciaId = Guid.NewGuid();
        var dto = new CreateProyectoDto("Test", "Location", userId, 8, "DevData", null, "DC-123", ProvinciaId: invalidProvinciaId);

        var plan = Tests.Shared.TestPlanFactory.Profesional();
        var user = new Usuario("Test", "User", "test@test.com", "hash", UserRole.User, "123456", "40200000000");
        user.GetType().GetProperty("Id")?.SetValue(user, userId);
        user.GetType().GetProperty("Plan")?.SetValue(user, plan);
        user.UpdateStripeSubscription("mock_sub", "active", DateTime.UtcNow.AddMonths(1));
        _usuarioRepositoryMock.Setup(r => r.GetByIdWithPlanAsync(userId, It.IsAny<CancellationToken>())).ReturnsAsync(user);
        _proyectoRepositoryMock.Setup(r => r.GetCategoriasAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<CategoriaProyecto> { new CategoriaProyecto { Id = 8, Nombre = "COMERCIAL Y OFICINAS", Activo = true } });
        _proyectoRepositoryMock.Setup(r => r.GetEstadoByStatusAsync(ProjectStatus.Creado, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ProyectoEstado(ProjectStatusCodes.Creado, "Creado", "desc", "cond", "#9BACD8"));

        await Assert.ThrowsAsync<ArgumentException>(() => _projectService.CreateProjectAsync(dto));
    }

    [Fact]
    public async Task CreateProject_NotifiesCreator_WithProyectoCreado()
    {
        var userId = Guid.NewGuid();
        var dto = new CreateProyectoDto("Test", "Location", userId, 8, "DevData", null, "DC-123");
        var plan = Tests.Shared.TestPlanFactory.Profesional();
        var user = new Usuario("Test", "User", "test@test.com", "hash", UserRole.User, "123456", "40200000000");
        user.GetType().GetProperty("Id")?.SetValue(user, userId);
        user.GetType().GetProperty("Plan")?.SetValue(user, plan);
        user.UpdateStripeSubscription("mock_sub", "active", DateTime.UtcNow.AddMonths(1));

        _usuarioRepositoryMock.Setup(r => r.GetByIdWithPlanAsync(userId, It.IsAny<CancellationToken>())).ReturnsAsync(user);
        _proyectoRepositoryMock.Setup(r => r.GetCategoriasAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<CategoriaProyecto> { new CategoriaProyecto { Id = 8, Nombre = "COMERCIAL Y OFICINAS", Activo = true } });
        _proyectoRepositoryMock.Setup(r => r.GetEstadoByStatusAsync(ProjectStatus.Creado, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ProyectoEstado(ProjectStatusCodes.Creado, "Creado", "desc", "cond", "#9BACD8"));
        _proyectoRepositoryMock.Setup(r => r.AddAsync(It.IsAny<Proyecto>(), It.IsAny<CancellationToken>())).Returns(Task.CompletedTask);
        _unitOfWorkMock.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);
        _notificationFactoryMock.Setup(f => f.CreateAsync(It.IsAny<Guid>(), It.IsAny<int>(), It.IsAny<string>(), It.IsAny<string?>(), It.IsAny<Guid?>(), It.IsAny<string?>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Notificacion(userId, "Proyecto creado", "Info", "/dashboard"));

        await _projectService.CreateProjectAsync(dto);

        _notificationFactoryMock.Verify(f => f.CreateAsync(
            userId,
            TipoNotificacionId.ProyectoCreado,
            It.Is<string>(m => m.Contains("Test")),
            It.IsAny<string>(),
            It.IsAny<Guid?>(),
            It.IsAny<string?>(),
            It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task CreateProject_NotifiesTitular_WhenUserIsDelegate()
    {
        var userId = Guid.NewGuid();
        var titularId = Guid.NewGuid();
        var dto = new CreateProyectoDto("Test", "Location", userId, 8, "DevData", null, "DC-123");
        var plan = Tests.Shared.TestPlanFactory.Empresa();

        var user = new Usuario("Delegado", "User", "delegado@test.com", "hash", UserRole.User, "123456", "40200000000");
        user.GetType().GetProperty("Id")?.SetValue(user, userId);
        user.GetType().GetProperty("Plan")?.SetValue(user, plan);
        user.GetType().GetProperty("TitularId")?.SetValue(user, titularId);
        user.UpdateStripeSubscription("mock_sub", "active", DateTime.UtcNow.AddMonths(1));

        var titular = new Usuario("Titular", "Empresa", "titular@test.com", "hash", UserRole.User, "654321", "40200000001");
        titular.GetType().GetProperty("Id")?.SetValue(titular, titularId);
        titular.GetType().GetProperty("Plan")?.SetValue(titular, plan);

        _usuarioRepositoryMock.Setup(r => r.GetByIdWithPlanAsync(userId, It.IsAny<CancellationToken>())).ReturnsAsync(user);
        _usuarioRepositoryMock.Setup(r => r.GetByIdAsync(titularId, It.IsAny<CancellationToken>())).ReturnsAsync(titular);
        _proyectoRepositoryMock.Setup(r => r.GetCategoriasAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<CategoriaProyecto> { new CategoriaProyecto { Id = 8, Nombre = "COMERCIAL Y OFICINAS", Activo = true } });
        _proyectoRepositoryMock.Setup(r => r.GetEstadoByStatusAsync(ProjectStatus.Creado, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ProyectoEstado(ProjectStatusCodes.Creado, "Creado", "desc", "cond", "#9BACD8"));
        _proyectoRepositoryMock.Setup(r => r.AddAsync(It.IsAny<Proyecto>(), It.IsAny<CancellationToken>())).Returns(Task.CompletedTask);
        _unitOfWorkMock.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);
        _notificationFactoryMock.Setup(f => f.CreateAsync(It.IsAny<Guid>(), It.IsAny<int>(), It.IsAny<string>(), It.IsAny<string?>(), It.IsAny<Guid?>(), It.IsAny<string?>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Notificacion(userId, "Proyecto creado", "Info", "/dashboard"));

        await _projectService.CreateProjectAsync(dto);

        _notificationFactoryMock.Verify(f => f.CreateAsync(
            titularId,
            TipoNotificacionId.ProyectoCreado,
            It.Is<string>(m => m.Contains("Delegado")),
            It.IsAny<string>(),
            It.IsAny<Guid?>(),
            It.IsAny<string?>(),
            It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task UpdateProject_NotifiesCreator_WithProyectoEditado()
    {
        var id = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var estadoCreado = new ProyectoEstado(ProjectStatusCodes.Creado, "Creado", "desc", "cond", "#9BACD8");
        var estadoEditado = new ProyectoEstado(ProjectStatusCodes.Editado, "Editado", "desc", "cond", "#F98513");
        var proyecto = new Proyecto("Old", "OldLoc", userId, 12);
        proyecto.UpdateEstado(estadoCreado);
        var dto = new UpdateProyectoDto("Updated", "NewLoc", null, 1000, 12, "NewDev", null, "NewDC", null, null, null, null, null, null);

        var user = new Usuario("Test", "User", "test@test.com", "hash", UserRole.User, "123456", "40200000000");
        user.GetType().GetProperty("Id")?.SetValue(user, userId);

        _proyectoRepositoryMock.Setup(r => r.GetByIdAsync(id, It.IsAny<CancellationToken>())).ReturnsAsync(proyecto);
        _proyectoRepositoryMock.Setup(r => r.GetCategoriasAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<CategoriaProyecto> { new CategoriaProyecto { Id = 12, Nombre = "HOSPEDAJE", Activo = true } });
        _proyectoRepositoryMock.Setup(r => r.GetEstadoByStatusAsync(ProjectStatus.Editado, It.IsAny<CancellationToken>())).ReturnsAsync(estadoEditado);
        _usuarioRepositoryMock.Setup(r => r.GetByIdAsync(userId, It.IsAny<CancellationToken>())).ReturnsAsync(user);
        _unitOfWorkMock.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);
        _notificationFactoryMock.Setup(f => f.CreateAsync(It.IsAny<Guid>(), It.IsAny<int>(), It.IsAny<string>(), It.IsAny<string?>(), It.IsAny<Guid?>(), It.IsAny<string?>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Notificacion(userId, "Editado", "Info"));

        await _projectService.UpdateProjectAsync(id, dto);

        _notificationFactoryMock.Verify(f => f.CreateAsync(
            userId, TipoNotificacionId.ProyectoEditado,
            It.Is<string>(m => m.Contains("Updated")),
            It.IsAny<string>(), It.IsAny<Guid?>(), It.IsAny<string?>(), It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task UpdateProjectStatus_NotifiesOnPublicado()
    {
        var id = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var estadoPublicado = new ProyectoEstado(ProjectStatusCodes.Publicado, "Publicado", "desc", "cond", "#10B981");
        var proyecto = new Proyecto("Test", "Loc", userId, 8);
        var user = new Usuario("Test", "User", "test@test.com", "hash", UserRole.User, "123456", "40200000000");
        user.GetType().GetProperty("Id")?.SetValue(user, userId);
        var plan = Tests.Shared.TestPlanFactory.Profesional();
        user.GetType().GetProperty("Plan")?.SetValue(user, plan);
        user.UpdateStripeSubscription("mock_sub", "active", DateTime.UtcNow.AddMonths(1));

        _proyectoRepositoryMock.Setup(r => r.GetByIdAsync(id, It.IsAny<CancellationToken>())).ReturnsAsync(proyecto);
        _proyectoRepositoryMock.Setup(r => r.GetEstadoByStatusAsync(ProjectStatus.Publicado, It.IsAny<CancellationToken>())).ReturnsAsync(estadoPublicado);
        _usuarioRepositoryMock.Setup(r => r.GetByIdWithPlanAsync(userId, It.IsAny<CancellationToken>())).ReturnsAsync(user);
        _usuarioRepositoryMock.Setup(r => r.GetByIdAsync(userId, It.IsAny<CancellationToken>())).ReturnsAsync(user);
        _unitOfWorkMock.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);
        _notificationFactoryMock.Setup(f => f.CreateAsync(It.IsAny<Guid>(), It.IsAny<int>(), It.IsAny<string>(), It.IsAny<string?>(), It.IsAny<Guid?>(), It.IsAny<string?>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Notificacion(userId, "Publicado", "Info"));

        await _projectService.UpdateProjectStatusAsync(id, ProjectStatus.Publicado);

        _notificationFactoryMock.Verify(f => f.CreateAsync(
            userId, TipoNotificacionId.ProyectoPublicado,
            It.IsAny<string>(), It.IsAny<string>(), It.IsAny<Guid?>(), It.IsAny<string?>(), It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task UpdateProjectStatus_NotifiesOnRevision()
    {
        var id = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var estadoRevision = new ProyectoEstado(ProjectStatusCodes.Revision, "En Revisión", "desc", "cond", "#EAB308");
        var proyecto = new Proyecto("Test", "Loc", userId, 8);
        var user = new Usuario("Test", "User", "test@test.com", "hash", UserRole.User, "123456", "40200000000");
        user.GetType().GetProperty("Id")?.SetValue(user, userId);

        _proyectoRepositoryMock.Setup(r => r.GetByIdAsync(id, It.IsAny<CancellationToken>())).ReturnsAsync(proyecto);
        _proyectoRepositoryMock.Setup(r => r.GetEstadoByStatusAsync(ProjectStatus.Revision, It.IsAny<CancellationToken>())).ReturnsAsync(estadoRevision);
        _usuarioRepositoryMock.Setup(r => r.GetByIdAsync(userId, It.IsAny<CancellationToken>())).ReturnsAsync(user);
        _unitOfWorkMock.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);
        _notificationFactoryMock.Setup(f => f.CreateAsync(It.IsAny<Guid>(), It.IsAny<int>(), It.IsAny<string>(), It.IsAny<string?>(), It.IsAny<Guid?>(), It.IsAny<string?>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Notificacion(userId, "Revisión", "Info"));

        await _projectService.UpdateProjectStatusAsync(id, ProjectStatus.Revision);

        _notificationFactoryMock.Verify(f => f.CreateAsync(
            userId, TipoNotificacionId.ProyectoEnRevision,
            It.IsAny<string>(), It.IsAny<string>(), It.IsAny<Guid?>(), It.IsAny<string?>(), It.IsAny<CancellationToken>()),
            Times.Once);
    }
}



