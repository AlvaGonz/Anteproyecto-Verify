namespace UnitTests.Application.Features.Reports;

using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using global::Application.Abstractions.Persistence;
using global::Application.Features.Reports.Queries.GetPublicProjectReport;
using Domain.Entities;
using Domain.Enums;
using Moq;
using Xunit;

public class GetPublicProjectReportQueryHandlerTests
{
    private readonly Mock<IReporteRepository> _mockReporteRepo;
    private readonly Mock<IProyectoRepository> _mockProyectoRepo;
    private readonly GetPublicProjectReportQueryHandler _handler;

    public GetPublicProjectReportQueryHandlerTests()
    {
        _mockReporteRepo = new Mock<IReporteRepository>();
        _mockProyectoRepo = new Mock<IProyectoRepository>();
        _handler = new GetPublicProjectReportQueryHandler(_mockReporteRepo.Object, _mockProyectoRepo.Object);
    }

    [Fact]
    public async Task HandleAsync_ShouldReturnReport_WhenProjectAndReportExist()
    {
        // Arrange
        var projectId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var proyecto = new Proyecto("Test Project", "Loc", userId);
        proyecto.UpdateStatus(ProjectStatus.Approved);

        var reporte = new Reporte(projectId, userId);
        reporte.MarkAsGenerated("Resumen test");

        _mockProyectoRepo.Setup(r => r.GetByIdAsync(projectId, It.IsAny<CancellationToken>())).ReturnsAsync(proyecto);
        _mockReporteRepo.Setup(r => r.GetByProyectoIdAsync(projectId, It.IsAny<CancellationToken>())).ReturnsAsync(new List<Reporte> { reporte });

        // Act
        var result = await _handler.HandleAsync(projectId);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(projectId, result.ProyectoId);
        Assert.Equal("Aprobado", result.EstadoProyectoVisible);
        Assert.Equal("Resumen test", result.ResumenPublico);
        Assert.True(result.EsPublico);
    }

    [Fact]
    public async Task HandleAsync_ShouldReturnNull_WhenNoGeneratedReportExists()
    {
        // Arrange
        var projectId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var proyecto = new Proyecto("Test Project", "Loc", userId);

        var reporte = new Reporte(projectId, userId); // Draft status

        _mockProyectoRepo.Setup(r => r.GetByIdAsync(projectId, It.IsAny<CancellationToken>())).ReturnsAsync(proyecto);
        _mockReporteRepo.Setup(r => r.GetByProyectoIdAsync(projectId, It.IsAny<CancellationToken>())).ReturnsAsync(new List<Reporte> { reporte });

        // Act
        var result = await _handler.HandleAsync(projectId);

        // Assert
        Assert.Null(result);
    }
}
