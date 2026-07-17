namespace UnitTests.Application.Features.Reports.Queries;

using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using global::Application.Abstractions.Persistence;
using global::Application.Features.Reports.Queries.GenerarReporteHallazgos;
using global::Infrastructure.Services.Reports;
using Domain.Entities;
using Domain.Enums;
using Moq;
using Xunit;

public class GenerarReporteHallazgosQueryHandlerTests
{
    private readonly Mock<IProyectoRepository> _proyectoRepositoryMock;
    private readonly Mock<IHallazgoRepository> _hallazgoRepositoryMock;
    private readonly Mock<IValidacionRepository> _validacionRepositoryMock;
    private readonly ReporteBuilderService _reporteBuilder;
    private readonly GenerarReporteHallazgosQueryHandler _handler;

    public GenerarReporteHallazgosQueryHandlerTests()
    {
        _proyectoRepositoryMock = new Mock<IProyectoRepository>();
        _hallazgoRepositoryMock = new Mock<IHallazgoRepository>();
        _validacionRepositoryMock = new Mock<IValidacionRepository>();
        _reporteBuilder = new ReporteBuilderService(_proyectoRepositoryMock.Object, _hallazgoRepositoryMock.Object, _validacionRepositoryMock.Object);
        _handler = new GenerarReporteHallazgosQueryHandler(_reporteBuilder);
    }

    [Fact]
    public async Task Handle_ShouldReturnApto_WhenNoCriticalOrHighFindings()
    {
        // Arrange
        var projectId = Guid.NewGuid();
        var project = new Proyecto("Test Project", "Loc", Guid.NewGuid());
        
        var hallazgos = new List<Hallazgo>
        {
            new Hallazgo(projectId, null, "Test", "Desc", FindingSeverity.Low, "Rec", "Src"),
            new Hallazgo(projectId, null, "Test2", "Desc2", FindingSeverity.Medium, "Rec2", "Src2")
        };

        _proyectoRepositoryMock.Setup(x => x.GetByIdAsync(projectId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(project);
        _hallazgoRepositoryMock.Setup(x => x.GetByProyectoIdAsync(projectId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(hallazgos);

        var query = new GenerarReporteHallazgosQuery { ProyectoId = projectId };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        Assert.True(result.EsAptoParaSello);
        Assert.Equal(2, result.TotalHallazgos);
        Assert.Equal(0, result.HallazgosCriticos);
        Assert.Equal(0, result.HallazgosAltos);
    }

    [Fact]
    public async Task Handle_ShouldReturnNotApto_WhenHighFindingsExist()
    {
        // Arrange
        var projectId = Guid.NewGuid();
        var project = new Proyecto("Test Project", "Loc", Guid.NewGuid());
        
        var hallazgos = new List<Hallazgo>
        {
            new Hallazgo(projectId, null, "Test", "Desc", FindingSeverity.High, "Rec", "Src")
        };

        _proyectoRepositoryMock.Setup(x => x.GetByIdAsync(projectId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(project);
        _hallazgoRepositoryMock.Setup(x => x.GetByProyectoIdAsync(projectId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(hallazgos);

        var query = new GenerarReporteHallazgosQuery { ProyectoId = projectId };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        Assert.False(result.EsAptoParaSello);
        Assert.Equal(1, result.TotalHallazgos);
        Assert.Equal(1, result.HallazgosAltos);
    }
}

