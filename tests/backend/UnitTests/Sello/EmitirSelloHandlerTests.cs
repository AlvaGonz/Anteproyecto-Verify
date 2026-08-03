namespace UnitTests.Application.Features.Sello.Commands;

using System;
using System.Threading;
using System.Threading.Tasks;
using global::Application.Abstractions.Persistence;
using global::Application.Abstractions.Reports;
using global::Application.Features.Sello.Commands.EmitirSello;
using Domain.Entities;
using Moq;
using Xunit;

public class EmitirSelloCommandHandlerTests
{
    private readonly Mock<IProyectoRepository> _proyectoRepositoryMock;
    private readonly Mock<ISelloIntegridadRepository> _selloRepositoryMock;
    private readonly Mock<IReporteBuilder> _reporteBuilderMock;
    private readonly Mock<IAuditoriaRepository> _auditoriaRepositoryMock;
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly EmitirSelloCommandHandler _handler;

    public EmitirSelloCommandHandlerTests()
    {
        _proyectoRepositoryMock = new Mock<IProyectoRepository>();
        _selloRepositoryMock = new Mock<ISelloIntegridadRepository>();
        _reporteBuilderMock = new Mock<IReporteBuilder>();
        _auditoriaRepositoryMock = new Mock<IAuditoriaRepository>();
        _unitOfWorkMock = new Mock<IUnitOfWork>();

        _handler = new EmitirSelloCommandHandler(
            _proyectoRepositoryMock.Object,
            _selloRepositoryMock.Object,
            _reporteBuilderMock.Object,
            _auditoriaRepositoryMock.Object,
            _unitOfWorkMock.Object);
    }

    [Fact]
    public async Task Handle_ShouldFail_WhenNotApto()
    {
        // Arrange
        var projectId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var project = new Proyecto("Test", "Loc", Guid.NewGuid(), 16);

        _proyectoRepositoryMock.Setup(x => x.GetByIdAsync(projectId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(project);
        _selloRepositoryMock.Setup(x => x.GetByProyectoIdAsync(projectId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((SelloIntegridad?)null);
        _reporteBuilderMock.Setup(x => x.BuildReporteAsync(projectId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ReporteHallazgosDto { EsAptoParaSello = false });

        var command = new EmitirSelloCommand { ProyectoId = projectId, UsuarioId = userId };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.False(result.IsSuccess);
        Assert.Equal("El proyecto no es apto para el sello de integridad debido a hallazgos crÃ­ticos o altos.", result.Mensaje);
        _selloRepositoryMock.Verify(x => x.AddAsync(It.IsAny<SelloIntegridad>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_ShouldSucceed_WhenAptoAndNoSelloVigente()
    {
        // Arrange
        var projectId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var project = new Proyecto("Test", "Loc", Guid.NewGuid(), 16);

        _proyectoRepositoryMock.Setup(x => x.GetByIdAsync(projectId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(project);
        _selloRepositoryMock.Setup(x => x.GetByProyectoIdAsync(projectId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((SelloIntegridad?)null);
        _reporteBuilderMock.Setup(x => x.BuildReporteAsync(projectId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ReporteHallazgosDto { EsAptoParaSello = true });

        var command = new EmitirSelloCommand { ProyectoId = projectId, UsuarioId = userId };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.NotNull(result.CodigoSello);
        Assert.NotNull(result.UrlQr);
        _selloRepositoryMock.Verify(x => x.AddAsync(It.IsAny<SelloIntegridad>(), It.IsAny<CancellationToken>()), Times.Once);
        _unitOfWorkMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}

