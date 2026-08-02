namespace UnitTests.Application.Features.PublicVerification;

using System;
using System.Threading;
using System.Threading.Tasks;
using global::Application.Abstractions.Persistence;
using global::Application.Features.PublicVerification.Queries.GetPublicProjectVerification;
using Domain.Entities;
using Domain.Enums;
using Moq;
using Xunit;

public class GetPublicProjectVerificationQueryHandlerTests
{
    private readonly Mock<ICertificacionRepository> _mockRepo;
    private readonly GetPublicProjectVerificationQueryHandler _handler;

    public GetPublicProjectVerificationQueryHandlerTests()
    {
        _mockRepo = new Mock<ICertificacionRepository>();
        _handler = new GetPublicProjectVerificationQueryHandler(_mockRepo.Object);
    }

    [Fact]
    public async Task HandleAsync_ShouldReturnDto_WhenCodeIsValid()
    {
        // Arrange
        var code = "VF-2026-TEST";
        var projectId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var proyecto = new Proyecto("Test Project", "Test Location", userId, 16);

        var cert = new Certificacion(projectId, Guid.NewGuid(), code, "http://test.com", 100, IntegrityStatus.Valid, userId);
        
        // Use reflection to set the navigation property for testing
        var prop = typeof(Certificacion).GetProperty("Proyecto");
        prop?.SetValue(cert, proyecto);

        _mockRepo.Setup(r => r.GetByCodigoAsync(code, It.IsAny<CancellationToken>())).ReturnsAsync(cert);

        // Act
        var result = await _handler.HandleAsync(code);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(code, result.PublicCode);
        Assert.Equal("Test Project", result.ProjectName);
        Assert.Equal("Test Location", result.PublicLocation);
        Assert.Equal("Desconocido", result.PublicProjectStatus);
        Assert.Equal("Consistente", result.IntegrityStatus);
        Assert.True(result.IsVerifiable);
    }

    [Fact]
    public async Task HandleAsync_ShouldReturnNull_WhenCodeIsNotFound()
    {
        // Arrange
        var code = "INVALID";
        _mockRepo.Setup(r => r.GetByCodigoAsync(code, It.IsAny<CancellationToken>())).ReturnsAsync((Certificacion?)null);

        // Act
        var result = await _handler.HandleAsync(code);

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task HandleAsync_ShouldReturnNotVerifiable_WhenCertIsRevoked()
    {
        // Arrange
        var code = "VF-2026-REVOKED";
        var projectId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var proyecto = new Proyecto("Test Project", "Test Location", userId, 16);
        
        var cert = new Certificacion(projectId, Guid.NewGuid(), code, "http://test.com", 100, IntegrityStatus.Valid, userId);
        cert.Revoke("Test Revocation");
        
        var prop = typeof(Certificacion).GetProperty("Proyecto");
        prop?.SetValue(cert, proyecto);

        _mockRepo.Setup(r => r.GetByCodigoAsync(code, It.IsAny<CancellationToken>())).ReturnsAsync(cert);

        // Act
        var result = await _handler.HandleAsync(code);

        // Assert
        Assert.NotNull(result);
        Assert.False(result.IsVerifiable);
        Assert.Contains("revocada", result.VerificationMessage);
    }
}


