namespace UnitTests.Application.Features.Validation.Queries;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using global::Application.Abstractions.Persistence;
using global::Application.Features.Validation.Queries.GetActiveAlertsByProject;
using Domain.Entities;
using Domain.Enums;
using Moq;
using Xunit;

public class GetActiveAlertsByProjectQueryHandlerTests
{
    private readonly Mock<IAlertaValidacionRepository> _alertaRepositoryMock;
    private readonly GetActiveAlertsByProjectQueryHandler _handler;

    public GetActiveAlertsByProjectQueryHandlerTests()
    {
        _alertaRepositoryMock = new Mock<IAlertaValidacionRepository>();
        _handler = new GetActiveAlertsByProjectQueryHandler(_alertaRepositoryMock.Object);
    }

    [Fact]
    public async Task Handle_ShouldReturnOnlyActiveAlerts()
    {
        // Arrange
        var projectId = Guid.NewGuid();
        var alert1 = new AlertaValidacion(projectId, AlertType.Informativa, AlertCategory.VigenciaDocumental, "T1", "D1", "Bajo");
        var alert2 = new AlertaValidacion(projectId, AlertType.Advertencia, AlertCategory.InconsistenciaDocumental, "T2", "D2", "Medio");
        alert2.Resolve(); // This one is resolved

        _alertaRepositoryMock.Setup(x => x.GetByProyectoIdAsync(projectId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<AlertaValidacion> { alert1, alert2 });

        var query = new GetActiveAlertsByProjectQuery { ProyectoId = projectId };

        // Act
        var results = await _handler.Handle(query, CancellationToken.None);

        // Assert
        Assert.NotNull(results);
        Assert.Single(results);
        Assert.Equal("T1", results.First().Titulo);
    }
}
