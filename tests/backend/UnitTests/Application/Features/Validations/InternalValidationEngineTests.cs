namespace UnitTests.Application.Features.Validations;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using global::Application.Abstractions.Persistence;
using global::Application.Abstractions.Validation;
using global::Application.Services.Validation;
using global::Application.Services.Validation.Rules.RequiredDocuments;
using Domain.Entities;
using Domain.Enums;
using Moq;
using Xunit;

public class InternalValidationEngineTests
{
    [Fact]
    public async Task RunValidationAsync_ShouldGenerateFindings_WhenRequiredDocumentsAreMissing()
    {
        // Arrange
        var projectId = Guid.NewGuid();
        var proyecto = new Proyecto("Test Project", "Location", Guid.NewGuid());
        
        var mockProyectoRepo = new Mock<IProyectoRepository>();
        mockProyectoRepo.Setup(r => r.GetByIdAsync(projectId, It.IsAny<CancellationToken>())).ReturnsAsync(proyecto);

        var mockDocumentoRepo = new Mock<IDocumentoRepository>();
        // Return empty documents list
        mockDocumentoRepo.Setup(r => r.GetByProyectoIdAsync(projectId, It.IsAny<CancellationToken>())).ReturnsAsync(new List<Documento>());

        var mockValidacionRepo = new Mock<IValidacionRepository>();
        var mockHallazgoRepo = new Mock<IHallazgoRepository>();
        var mockUnitOfWork = new Mock<IUnitOfWork>();

        var rules = new List<IValidationRule> { new RequiredDocumentsRule() };

        var engine = new InternalValidationEngine(
            mockProyectoRepo.Object,
            mockDocumentoRepo.Object,
            mockValidacionRepo.Object,
            mockHallazgoRepo.Object,
            mockUnitOfWork.Object,
            rules
        );

        // Act
        var result = await engine.RunValidationAsync(projectId);

        // Assert
        Assert.NotNull(result);
        Assert.False(result.EsLegitimo);
        Assert.Equal(0, result.PassedCount);
        Assert.Equal(3, result.FailedCount); // Title, Plan, Permit are missing
        mockHallazgoRepo.Verify(r => r.AddAsync(It.IsAny<Hallazgo>(), It.IsAny<CancellationToken>()), Times.Exactly(3));
        mockUnitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
