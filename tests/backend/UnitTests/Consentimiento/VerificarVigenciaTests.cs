namespace UnitTests.Application.Features.Consentimiento.Queries;

using System;
using System.Threading;
using System.Threading.Tasks;
using global::Application.Abstractions.Persistence;
using global::Application.Features.Consentimiento.Queries.VerificarConsentimientoVigente;
using Domain.Entities;
using Moq;
using Xunit;

public class VerificarVigenciaTests
{
    private readonly Mock<IConsentimientoRepository> _consentimientoRepositoryMock;
    private readonly VerificarConsentimientoVigenteQueryHandler _handler;

    public VerificarVigenciaTests()
    {
        _consentimientoRepositoryMock = new Mock<IConsentimientoRepository>();
        _handler = new VerificarConsentimientoVigenteQueryHandler(_consentimientoRepositoryMock.Object);
    }

    [Fact]
    public async Task Handle_ShouldReturnTrue_WhenConsentIsVigente()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var consent = new ConsentimientoFinanciero(userId, "1.1.1.1", "v1.0");
        
        _consentimientoRepositoryMock.Setup(x => x.GetVigenteByUsuarioIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(consent);

        var query = new VerificarConsentimientoVigenteQuery { UsuarioId = userId };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        Assert.True(result.TieneConsentimientoVigente);
    }

    [Fact]
    public async Task Handle_ShouldReturnFalse_WhenNoConsentIsVigente()
    {
        // Arrange
        var userId = Guid.NewGuid();
        
        _consentimientoRepositoryMock.Setup(x => x.GetVigenteByUsuarioIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((ConsentimientoFinanciero?)null);

        var query = new VerificarConsentimientoVigenteQuery { UsuarioId = userId };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        Assert.False(result.TieneConsentimientoVigente);
    }
}

