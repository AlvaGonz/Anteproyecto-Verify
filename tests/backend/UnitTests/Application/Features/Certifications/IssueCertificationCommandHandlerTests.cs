namespace UnitTests.Application.Features.Certifications;

using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using global::Application.Abstractions.Certifications;
using global::Application.Abstractions.Persistence;
using global::Application.Features.Certifications.Commands.IssueCertification;
using Domain.Entities;
using Domain.Enums;
using Microsoft.Extensions.Configuration;
using Moq;
using Xunit;

public class IssueCertificationCommandHandlerTests
{
    private readonly Mock<IProyectoRepository> _mockProyectoRepo;
    private readonly Mock<ICertificacionRepository> _mockCertificacionRepo;
    private readonly Mock<IReporteRepository> _mockReporteRepo;
    private readonly Mock<ICertificationCodeGenerator> _mockCodeGenerator;
    private readonly Mock<IUnitOfWork> _mockUnitOfWork;
    private readonly Mock<IConfiguration> _mockConfig;
    private readonly IssueCertificationCommandHandler _handler;

    public IssueCertificationCommandHandlerTests()
    {
        _mockProyectoRepo = new Mock<IProyectoRepository>();
        _mockCertificacionRepo = new Mock<ICertificacionRepository>();
        _mockReporteRepo = new Mock<IReporteRepository>();
        _mockCodeGenerator = new Mock<ICertificationCodeGenerator>();
        _mockUnitOfWork = new Mock<IUnitOfWork>();
        _mockConfig = new Mock<IConfiguration>();

        _mockConfig.Setup(c => c["PublicPortalBaseUrl"]).Returns("http://test.com");

        _handler = new IssueCertificationCommandHandler(
            _mockProyectoRepo.Object,
            _mockCertificacionRepo.Object,
            _mockReporteRepo.Object,
            _mockCodeGenerator.Object,
            _mockUnitOfWork.Object,
            _mockConfig.Object
        );
    }

    [Fact]
    public async Task HandleAsync_ShouldIssueCertification_WhenProjectIsValid()
    {
        // Arrange
        var projectId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var proyecto = new Proyecto("Test", "Loc", userId);

        // Simulate setting IntegrityStatus (since it's private set, we might need reflection or just assume it's Pending/Valid for the test)
        
        _mockProyectoRepo.Setup(r => r.GetByIdAsync(projectId, It.IsAny<CancellationToken>())).ReturnsAsync(proyecto);
        
        var reporte = new Reporte(projectId, userId);
        _mockReporteRepo.Setup(r => r.GetByProyectoIdAsync(projectId, It.IsAny<CancellationToken>())).ReturnsAsync(new List<Reporte> { reporte });
        
        _mockCodeGenerator.Setup(g => g.GenerateCode()).Returns("VF-2026-TESTCODE");

        // Act
        var result = await _handler.HandleAsync(projectId, userId);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("VF-2026-TESTCODE", result.CodigoVerificacion);
        Assert.Equal(CertificationStatus.Emitido, result.EstadoCertificacion);
        _mockCertificacionRepo.Verify(r => r.AddAsync(It.IsAny<Certificacion>(), It.IsAny<CancellationToken>()), Times.Once);
        _mockUnitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task HandleAsync_ShouldThrowException_WhenProjectHasNoReport()
    {
        // Arrange
        var projectId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var proyecto = new Proyecto("Test", "Loc", userId);
        
        _mockProyectoRepo.Setup(r => r.GetByIdAsync(projectId, It.IsAny<CancellationToken>())).ReturnsAsync(proyecto);
        _mockReporteRepo.Setup(r => r.GetByProyectoIdAsync(projectId, It.IsAny<CancellationToken>())).ReturnsAsync(new List<Reporte>());

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(() => _handler.HandleAsync(projectId, userId));
    }
}

