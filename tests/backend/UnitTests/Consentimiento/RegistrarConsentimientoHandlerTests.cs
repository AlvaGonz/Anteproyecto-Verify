namespace UnitTests.Application.Features.Consentimiento.Commands;

using System;
using System.Threading;
using System.Threading.Tasks;
using global::Application.Abstractions.Persistence;
using global::Application.Features.Consentimiento.Commands.RegistrarConsentimiento;
using Domain.Entities;
using Microsoft.Extensions.Configuration;
using Moq;
using Xunit;

public class RegistrarConsentimientoCommandHandlerTests
{
    private readonly Mock<IConsentimientoRepository> _consentimientoRepositoryMock;
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly Mock<IConfiguration> _configurationMock;
    private readonly RegistrarConsentimientoCommandHandler _handler;

    public RegistrarConsentimientoCommandHandlerTests()
    {
        _consentimientoRepositoryMock = new Mock<IConsentimientoRepository>();
        _unitOfWorkMock = new Mock<IUnitOfWork>();
        _configurationMock = new Mock<IConfiguration>();

        var configSectionMock = new Mock<IConfigurationSection>();
        configSectionMock.Setup(x => x.Value).Returns("30");
        _configurationMock.Setup(x => x.GetSection("Consentimiento:VigenciaDias")).Returns(configSectionMock.Object);

        _handler = new RegistrarConsentimientoCommandHandler(
            _consentimientoRepositoryMock.Object,
            _unitOfWorkMock.Object,
            _configurationMock.Object);
    }

    [Fact]
    public async Task Handle_ShouldRevokePreviousAndCreateNewConsent()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var oldConsent = new ConsentimientoFinanciero(userId, "1.1.1.1", "v1.0");
        
        _consentimientoRepositoryMock.Setup(x => x.GetVigenteByUsuarioIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(oldConsent);

        var command = new RegistrarConsentimientoCommand
        {
            UsuarioId = userId,
            IpOrigen = "2.2.2.2",
            VersionPolitica = "v2.0"
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.True(result.IsSuccess);
        _consentimientoRepositoryMock.Verify(x => x.Update(It.Is<ConsentimientoFinanciero>(c => c.Estado == Domain.Enums.EstadoConsentimiento.Revocado)), Times.Once);
        _consentimientoRepositoryMock.Verify(x => x.AddAsync(It.IsAny<ConsentimientoFinanciero>(), It.IsAny<CancellationToken>()), Times.Once);
        _unitOfWorkMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}

