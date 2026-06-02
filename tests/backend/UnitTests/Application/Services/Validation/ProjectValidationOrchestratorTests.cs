namespace UnitTests.Application.Services.Validation;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using global::Application.Abstractions.ExternalValidation;
using global::Application.Abstractions.Persistence;
using global::Application.Abstractions.Validation;
using global::Application.DTOs.ExternalValidation;
using global::Application.DTOs.Validation;
using global::Application.DTOs.Validations;
using global::Application.Services.Validation;
using Domain.Entities;
using Domain.Enums;
using Moq;
using Xunit;

public class ProjectValidationOrchestratorTests
{
    private readonly Mock<IProyectoRepository> _mockProyectoRepo;
    private readonly Mock<IInternalValidationEngine> _mockInternalEngine;
    private readonly Mock<IExternalProviderResolver> _mockProviderResolver;
    private readonly Mock<IAuditoriaRepository> _mockAuditoriaRepo;
    private readonly Mock<IReporteRepository> _mockReporteRepo;
    private readonly Mock<IIntegrityScoringService> _mockScoringService;
    private readonly Mock<ISelloIntegridadRepository> _mockSelloRepo;
    private readonly Mock<IUnitOfWork> _mockUnitOfWork;
    private readonly ProjectValidationOrchestrator _orchestrator;

    public ProjectValidationOrchestratorTests()
    {
        _mockProyectoRepo = new Mock<IProyectoRepository>();
        _mockInternalEngine = new Mock<IInternalValidationEngine>();
        _mockProviderResolver = new Mock<IExternalProviderResolver>();
        _mockAuditoriaRepo = new Mock<IAuditoriaRepository>();
        _mockReporteRepo = new Mock<IReporteRepository>();
        _mockScoringService = new Mock<IIntegrityScoringService>();
        _mockSelloRepo = new Mock<ISelloIntegridadRepository>();
        _mockUnitOfWork = new Mock<IUnitOfWork>();

        _orchestrator = new ProjectValidationOrchestrator(
            _mockProyectoRepo.Object,
            _mockInternalEngine.Object,
            _mockProviderResolver.Object,
            _mockAuditoriaRepo.Object,
            _mockReporteRepo.Object,
            _mockScoringService.Object,
            _mockSelloRepo.Object,
            _mockUnitOfWork.Object
        );
    }

    [Fact]
    public async Task RunFullValidationAsync_ShouldConsolidateResults_WhenAllProvidersSucceed()
    {
        // Arrange
        var projectId = Guid.NewGuid();
        var proyecto = new Proyecto("Test Project", "Location", Guid.NewGuid());
        _mockProyectoRepo.Setup(r => r.GetByIdAsync(projectId, It.IsAny<CancellationToken>())).ReturnsAsync(proyecto);

        var internalSummary = new InternalValidationSummaryDto(Guid.NewGuid(), projectId, ValidationStatus.Completed, true, 100.0, "Oro", 5, 0, 0, DateTime.UtcNow, new List<ValidationRuleResultDto>());
        _mockInternalEngine.Setup(e => e.RunValidationAsync(projectId, It.IsAny<CancellationToken>())).ReturnsAsync(internalSummary);

        _mockScoringService.Setup(s => s.CalculateScore(It.IsAny<IEnumerable<ValidationRuleResultDto>>(), It.IsAny<IEnumerable<ValidationSourceResult>>())).Returns(100.0);
        _mockScoringService.Setup(s => s.DetermineSello(projectId, 100.0, false)).Returns(new SelloIntegridad(projectId, "GOLD-123", "Oro", NivelSelloIntegridad.Oro, "http://qr", "firma"));

        var mockProvider = new Mock<IExternalValidationProvider>();
        mockProvider.Setup(p => p.ValidateAsync(It.IsAny<ExternalValidationRequest>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ExternalValidationResult(ExternalProviderType.DGRI, ExternalValidationStatus.Success, true, "Success", new List<string>(), DateTime.UtcNow, "REF"));

        _mockProviderResolver.Setup(r => r.Resolve(It.IsAny<ExternalProviderType>())).Returns(mockProvider.Object);

        // Act
        var result = await _orchestrator.RunFullValidationAsync(projectId);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(ValidationExecutionStatus.Completed, result.OverallStatus);
        Assert.True(result.IsFullyValid);
        Assert.NotNull(result.InternalValidation);
        Assert.Equal(6, result.ExternalSources.Count); // 6 enum values
        Assert.Empty(result.Errors);
        
        _mockReporteRepo.Verify(r => r.AddAsync(It.IsAny<Reporte>(), It.IsAny<CancellationToken>()), Times.Once);
        _mockUnitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
        _mockAuditoriaRepo.Verify(a => a.AddAsync(It.IsAny<Auditoria>(), It.IsAny<CancellationToken>()), Times.AtLeastOnce);
    }

    [Fact]
    public async Task RunFullValidationAsync_ShouldContinue_WhenOneProviderFails()
    {
        // Arrange
        var projectId = Guid.NewGuid();
        var proyecto = new Proyecto("Test Project", "Location", Guid.NewGuid());
        _mockProyectoRepo.Setup(r => r.GetByIdAsync(projectId, It.IsAny<CancellationToken>())).ReturnsAsync(proyecto);

        var internalSummary = new InternalValidationSummaryDto(Guid.NewGuid(), projectId, ValidationStatus.Completed, true, 50.0, null, 3, 0, 2, DateTime.UtcNow, new List<ValidationRuleResultDto>());
        _mockInternalEngine.Setup(e => e.RunValidationAsync(projectId, It.IsAny<CancellationToken>())).ReturnsAsync(internalSummary);

        _mockScoringService.Setup(s => s.CalculateScore(It.IsAny<IEnumerable<ValidationRuleResultDto>>(), It.IsAny<IEnumerable<ValidationSourceResult>>())).Returns(50.0);
        _mockScoringService.Setup(s => s.DetermineSello(projectId, 50.0, true)).Returns((SelloIntegridad?)null);

        var mockSuccessProvider = new Mock<IExternalValidationProvider>();
        mockSuccessProvider.Setup(p => p.ValidateAsync(It.IsAny<ExternalValidationRequest>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ExternalValidationResult(ExternalProviderType.DGRI, ExternalValidationStatus.Success, true, "Success", new List<string>(), DateTime.UtcNow, "REF"));

        var mockFailingProvider = new Mock<IExternalValidationProvider>();
        mockFailingProvider.Setup(p => p.ValidateAsync(It.IsAny<ExternalValidationRequest>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new Exception("Simulated provider error"));

        _mockProviderResolver.Setup(r => r.Resolve(It.IsAny<ExternalProviderType>()))
            .Returns<ExternalProviderType>(type => type == ExternalProviderType.Catastro ? mockFailingProvider.Object : mockSuccessProvider.Object);

        // Act
        var result = await _orchestrator.RunFullValidationAsync(projectId);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(ValidationExecutionStatus.Failed, result.OverallStatus); // Because there are errors
        Assert.False(result.IsFullyValid); // Because not all external sources are IsMatch (one failed)
        Assert.Single(result.Errors);
        Assert.Contains("Simulated provider error", result.Errors.First());
        
        var catastroResult = result.ExternalSources.First(s => s.SourceName == ExternalProviderType.Catastro.ToString());
        Assert.Equal(ExternalValidationStatus.Error.ToString(), catastroResult.Status);
        Assert.False(catastroResult.IsSuccess);
    }
}
