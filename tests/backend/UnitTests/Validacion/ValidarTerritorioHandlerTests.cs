namespace UnitTests.Application.Features.Validation.Commands;

using System;
using System.Threading;
using System.Threading.Tasks;
using global::Application.Abstractions.Geo;
using global::Application.Abstractions.Persistence;
using global::Application.Features.Validation.Commands.ValidarTerritorio;
using Domain.Entities;
using Domain.Enums;
using Domain.ValueObjects;
using Moq;
using Xunit;

public class ValidarTerritorioCommandHandlerTests
{
    private readonly Mock<IProyectoRepository> _proyectoRepositoryMock;
    private readonly Mock<ICatastroGeoService> _catastroGeoServiceMock;
    private readonly Mock<IHallazgoRepository> _hallazgoRepositoryMock;
    private readonly Mock<IAuditoriaRepository> _auditoriaRepositoryMock;
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly ValidarTerritorioCommandHandler _handler;

    public ValidarTerritorioCommandHandlerTests()
    {
        _proyectoRepositoryMock = new Mock<IProyectoRepository>();
        _catastroGeoServiceMock = new Mock<ICatastroGeoService>();
        _hallazgoRepositoryMock = new Mock<IHallazgoRepository>();
        _auditoriaRepositoryMock = new Mock<IAuditoriaRepository>();
        _unitOfWorkMock = new Mock<IUnitOfWork>();

        _handler = new ValidarTerritorioCommandHandler(
            _proyectoRepositoryMock.Object,
            _catastroGeoServiceMock.Object,
            _hallazgoRepositoryMock.Object,
            _auditoriaRepositoryMock.Object,
            _unitOfWorkMock.Object);
    }

    [Fact]
    public async Task Handle_ShouldNotExecute_WhenGpsIsNull()
    {
        // Arrange
        var projectId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var project = new Proyecto("Test", "Loc", userId);
        // UbicacionGps is null by default
        
        _proyectoRepositoryMock.Setup(x => x.GetByIdAsync(projectId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(project);

        var command = new ValidarTerritorioCommand { ProyectoId = projectId, UsuarioId = userId };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.False(result.Ejecutado);
        Assert.True(result.EsValido);
        _catastroGeoServiceMock.Verify(x => x.ValidarCoordenadasAsync(It.IsAny<Coordenadas>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_ShouldGenerateHallazgo_WhenFueraDeLimites()
    {
        // Arrange
        var projectId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var project = new Proyecto("Test", "Loc", userId);
        project.UpdateDetails("Test", "Loc", "25.0, -80.0", null, ProjectCategory.Residencial, null, null);
        
        _proyectoRepositoryMock.Setup(x => x.GetByIdAsync(projectId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(project);

        _catastroGeoServiceMock.Setup(x => x.ValidarCoordenadasAsync(It.IsAny<Coordenadas>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new CatastroGeoResult { IsSuccess = true, DentroDeLimites = false });

        var command = new ValidarTerritorioCommand { ProyectoId = projectId, UsuarioId = userId };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.True(result.Ejecutado);
        Assert.False(result.EsValido);
        _hallazgoRepositoryMock.Verify(x => x.AddAsync(It.IsAny<Hallazgo>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_ShouldGenerateHallazgo_WhenZonaIncompatible()
    {
        // Arrange
        var projectId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var project = new Proyecto("Test", "Loc", userId);
        project.UpdateDetails("Test", "Loc", "18.5, -69.9", null, ProjectCategory.Industrial, null, null);
        
        _proyectoRepositoryMock.Setup(x => x.GetByIdAsync(projectId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(project);

        _catastroGeoServiceMock.Setup(x => x.ValidarCoordenadasAsync(It.IsAny<Coordenadas>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new CatastroGeoResult { IsSuccess = true, DentroDeLimites = true, ZonaUsoSuelo = "Residencial" });

        var command = new ValidarTerritorioCommand { ProyectoId = projectId, UsuarioId = userId };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.True(result.Ejecutado);
        Assert.False(result.EsValido);
        _hallazgoRepositoryMock.Verify(x => x.AddAsync(It.IsAny<Hallazgo>(), It.IsAny<CancellationToken>()), Times.Once);
    }
}
