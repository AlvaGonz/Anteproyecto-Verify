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
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly ProjectService _projectService;

    public ProjectServiceTests()
    {
        _proyectoRepositoryMock = new Mock<IProyectoRepository>();
        _usuarioRepositoryMock = new Mock<IUsuarioRepository>();
        _emailNotificationServiceMock = new Mock<IEmailNotificationService>();
        _unitOfWorkMock = new Mock<IUnitOfWork>();
        _projectService = new ProjectService(
            _proyectoRepositoryMock.Object,
            _usuarioRepositoryMock.Object,
            _emailNotificationServiceMock.Object,
            _unitOfWorkMock.Object);
    }

    [Fact]
    public async Task CreateProject_ShouldReturnDto_WhenValid()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var dto = new CreateProyectoDto("Test", "Location", userId, ProjectCategory.Comercial, "DevData", null, "DC-123");
        
        var plan = Tests.Shared.TestPlanFactory.Profesional();
        var user = new Usuario("Test", "User", "test@test.com", "hash", UserRole.User, "123456", "40200000000");
        user.GetType().GetProperty("Id")?.SetValue(user, userId);
        user.GetType().GetProperty("Plan")?.SetValue(user, plan);
        user.UpdateStripeSubscription("mock_sub", "active", DateTime.UtcNow.AddMonths(1));
        
        _usuarioRepositoryMock.Setup(r => r.GetByIdWithPlanAsync(userId, It.IsAny<CancellationToken>())).ReturnsAsync(user);
        _proyectoRepositoryMock.Setup(r => r.AddAsync(It.IsAny<Proyecto>(), It.IsAny<CancellationToken>())).Returns(Task.CompletedTask);
        _unitOfWorkMock.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);

        // Act
        var result = await _projectService.CreateProjectAsync(dto);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Test", result.Nombre);
        Assert.Equal("Location", result.UbicacionTexto);
        Assert.Equal(ProjectCategory.Comercial, result.Categoria);
        Assert.Equal("DevData", result.DatosDesarrollador);
        Assert.Equal("DC-123", result.DesignacionCatastral);
        Assert.Equal(ProjectStatus.Draft, result.EstadoProyecto);
    }

    [Fact]
    public async Task UpdateProject_ShouldReturnDto_WhenValid()
    {
        // Arrange
        var id = Guid.NewGuid();
        var proyecto = new Proyecto("Old", "OldLoc", Guid.NewGuid());
        var dto = new UpdateProyectoDto("New", "NewLoc", null, 1000, ProjectCategory.Turistico, "NewDev", null, "NewDC", null, null, null, null);
        
        _proyectoRepositoryMock.Setup(r => r.GetByIdAsync(id, It.IsAny<CancellationToken>())).ReturnsAsync(proyecto);
        _unitOfWorkMock.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);

        // Act
        var result = await _projectService.UpdateProjectAsync(id, dto);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("New", result.Nombre);
        Assert.Equal("NewLoc", result.UbicacionTexto);
        Assert.Equal(1000, result.ValorEstimado);
        Assert.Equal(ProjectCategory.Turistico, result.Categoria);
        Assert.Equal("NewDev", result.DatosDesarrollador);
        Assert.Equal("NewDC", result.DesignacionCatastral);
    }

    [Fact]
    public async Task UpdateProject_ShouldThrowKeyNotFound_WhenNotFound()
    {
        // Arrange
        var id = Guid.NewGuid();
        var dto = new UpdateProyectoDto("New", "NewLoc", null, 1000, ProjectCategory.Turistico, "NewDev", null, "NewDC", null, null, null, null);
        
        _proyectoRepositoryMock.Setup(r => r.GetByIdAsync(id, It.IsAny<CancellationToken>())).ReturnsAsync((Proyecto?)null);

        // Act & Assert
        await Assert.ThrowsAsync<KeyNotFoundException>(() => _projectService.UpdateProjectAsync(id, dto));
    }

    [Fact]
    public async Task GetVisibleProjects_ShouldReturnOnlyVisible()
    {
        // Arrange
        var user = new Usuario("Test", "User", "test@test.com", "hash", UserRole.User, "123456", "40200000000");
        var p1 = new Proyecto("P1", "L1", user.Id);
        p1.UpdateStatus(ProjectStatus.Published);
        var p2 = new Proyecto("P2", "L2", user.Id);
        p2.UpdateStatus(ProjectStatus.InReview);

        _proyectoRepositoryMock.Setup(r => r.GetVisibleAsync(It.IsAny<CancellationToken>())).ReturnsAsync(new List<Proyecto> { p1, p2 });

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
        var proyecto = new Proyecto("P1", "L1", Guid.NewGuid());
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
        // Arrange
        var id = Guid.NewGuid();
        _proyectoRepositoryMock.Setup(r => r.GetByIdAsync(id, It.IsAny<CancellationToken>())).ReturnsAsync((Proyecto?)null);

        // Act
        var result = await _projectService.GetProjectByIdAsync(id);

        // Assert
        Assert.Null(result);
    }
}
