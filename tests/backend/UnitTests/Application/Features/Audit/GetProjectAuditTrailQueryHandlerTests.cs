namespace UnitTests.Application.Features.Audit;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using global::Application.Abstractions.Persistence;
using global::Application.Features.Audit.Queries.GetProjectAuditTrail;
using Domain.Entities;
using Moq;
using Xunit;

public class GetProjectAuditTrailQueryHandlerTests
{
    private readonly Mock<IAuditoriaRepository> _mockRepo;
    private readonly GetProjectAuditTrailQueryHandler _handler;

    public GetProjectAuditTrailQueryHandlerTests()
    {
        _mockRepo = new Mock<IAuditoriaRepository>();
        _handler = new GetProjectAuditTrailQueryHandler(_mockRepo.Object);
    }

    [Fact]
    public async Task HandleAsync_ShouldReturnAuditLogs_WhenNoFiltersApplied()
    {
        // Arrange
        var projectId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var logs = new List<Auditoria>
        {
            new Auditoria(userId, "Action1", "Type1", "Entity1", "1", projectId),
            new Auditoria(userId, "Action2", "Type2", "Entity2", "2", projectId)
        };

        _mockRepo.Setup(r => r.GetByProyectoIdAsync(projectId, It.IsAny<CancellationToken>())).ReturnsAsync(logs);

        // Act
        var result = await _handler.HandleAsync(projectId);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(2, result.Count());
    }

    [Fact]
    public async Task HandleAsync_ShouldFilterByTipoEvento()
    {
        // Arrange
        var projectId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var logs = new List<Auditoria>
        {
            new Auditoria(userId, "Action1", "Type1", "Entity1", "1", projectId),
            new Auditoria(userId, "Action2", "Type2", "Entity2", "2", projectId)
        };

        _mockRepo.Setup(r => r.GetByProyectoIdAsync(projectId, It.IsAny<CancellationToken>())).ReturnsAsync(logs);

        // Act
        var result = await _handler.HandleAsync(projectId, tipoEvento: "Type1");

        // Assert
        Assert.NotNull(result);
        Assert.Single(result);
        Assert.Equal("Type1", result.First().TipoEvento);
    }
}

