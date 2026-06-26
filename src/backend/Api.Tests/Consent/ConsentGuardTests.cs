using System;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.ExternalServices.Credit;
using Application.Abstractions.Persistence;
using Application.Features.Consentimiento.Commands.RegistrarConsentimiento;
using Application.Features.Credit.Commands.ConsultarCredito;
using Domain.Entities;
using Domain.Enums;
using Microsoft.Extensions.Configuration;
using NSubstitute;
using Xunit;

namespace Api.Tests.Consent;

public class ConsentGuardTests
{
    private readonly IConsentimientoRepository _consentRepoMock;
    private readonly IUnitOfWork _uowMock;
    private readonly IConfiguration _configMock;
    private readonly RegistrarConsentimientoCommandHandler _handler;

    // ConsultarCredito handler mocks
    private readonly IProyectoRepository _proyectoRepoMock;
    private readonly IUsuarioRepository _usuarioRepoMock;
    private readonly IResultadoCrediticioRepository _resultadoCredRepoMock;
    private readonly ITransUnionService _transUnionMock;
    private readonly IHallazgoRepository _hallazgoRepoMock;
    private readonly IAuditoriaRepository _auditoriaRepoMock;
    private readonly ConsultarCreditoCommandHandler _creditHandler;

    public ConsentGuardTests()
    {
        _consentRepoMock = Substitute.For<IConsentimientoRepository>();
        _uowMock = Substitute.For<IUnitOfWork>();
        _configMock = Substitute.For<IConfiguration>();

        // Setup config mock
        var section = Substitute.For<IConfigurationSection>();
        section.Value = "30";
        _configMock.GetSection("Consentimiento:VigenciaDias").Returns(section);

        _handler = new RegistrarConsentimientoCommandHandler(
            _consentRepoMock,
            _uowMock,
            _configMock
        );

        _proyectoRepoMock = Substitute.For<IProyectoRepository>();
        _usuarioRepoMock = Substitute.For<IUsuarioRepository>();
        _resultadoCredRepoMock = Substitute.For<IResultadoCrediticioRepository>();
        _transUnionMock = Substitute.For<ITransUnionService>();
        _hallazgoRepoMock = Substitute.For<IHallazgoRepository>();
        _auditoriaRepoMock = Substitute.For<IAuditoriaRepository>();

        _creditHandler = new ConsultarCreditoCommandHandler(
            _proyectoRepoMock,
            _usuarioRepoMock,
            _consentRepoMock,
            _resultadoCredRepoMock,
            _transUnionMock,
            _hallazgoRepoMock,
            _auditoriaRepoMock,
            _uowMock
        );
    }

    [Fact]
    public async Task RecordConsent_HappyPath_InsertsImmutableRecord()
    {
        // Arrange
        var request = new RegistrarConsentimientoCommand
        {
            UsuarioId = Guid.NewGuid(),
            IpOrigen = "127.0.0.1",
            VersionPolitica = "v1.0"
        };

        _consentRepoMock.GetVigenteByUsuarioIdAsync(request.UsuarioId, Arg.Any<CancellationToken>())
            .Returns(Task.FromResult<ConsentimientoFinanciero?>(null));

        // Act
        var result = await _handler.Handle(request, CancellationToken.None);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.NotEqual(Guid.Empty, result.ConsentimientoId);

        await _consentRepoMock.Received(1).AddAsync(Arg.Is<ConsentimientoFinanciero>(c => 
            c.UsuarioId == request.UsuarioId && 
            c.IpOrigen == request.IpOrigen &&
            c.VersionPolitica == request.VersionPolitica), Arg.Any<CancellationToken>());
        
        // No update is called when there's no prior consent
        _consentRepoMock.DidNotReceive().Update(Arg.Any<ConsentimientoFinanciero>());
    }

    [Fact]
    public async Task RecordConsent_ActiveConsentExists_RevokesPrevious()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var request = new RegistrarConsentimientoCommand
        {
            UsuarioId = userId,
            IpOrigen = "127.0.0.1",
            VersionPolitica = "v1.0"
        };

        var existingConsent = new ConsentimientoFinanciero(userId, "192.168.1.1", "v0.9", 30);

        _consentRepoMock.GetVigenteByUsuarioIdAsync(userId, Arg.Any<CancellationToken>())
            .Returns(Task.FromResult<ConsentimientoFinanciero?>(existingConsent));

        // Act
        var result = await _handler.Handle(request, CancellationToken.None);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.Equal(EstadoConsentimiento.Revocado, existingConsent.Estado);

        // Verify it revoked the existing
        _consentRepoMock.Received(1).Update(existingConsent);

        // Verify it added the new one
        await _consentRepoMock.Received(1).AddAsync(Arg.Any<ConsentimientoFinanciero>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CreditCheck_WithActiveConsent_ProceedsToTransUnion()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var projectId = Guid.NewGuid();
        var request = new ConsultarCreditoCommand { ProyectoId = projectId, UsuarioId = userId };

        var project = new Proyecto("Test Project", "Location", userId);
        var developer = new Usuario("Test", "User", "test@test.com", "809", Domain.Enums.UserRole.User, "123456789", "hash");
        typeof(Domain.Common.EntityBase).GetProperty("Id")?.SetValue(developer, userId);

        var activeConsent = new ConsentimientoFinanciero(userId, "127.0.0.1", "v1.0", 30);

        _proyectoRepoMock.GetByIdAsync(projectId, Arg.Any<CancellationToken>()).Returns(project);
        _usuarioRepoMock.GetByIdAsync(userId, Arg.Any<CancellationToken>()).Returns(developer);
        _consentRepoMock.GetVigenteByUsuarioIdAsync(userId, Arg.Any<CancellationToken>()).Returns(activeConsent);

        var tuResult = new TransUnionResult { IsSuccess = true, Score = 750, NivelRiesgo = NivelRiesgoCrediticio.Bajo };
        _transUnionMock.ConsultarHistorialAsync(Arg.Any<string>(), Arg.Any<CancellationToken>()).Returns(tuResult);

        // Act
        var result = await _creditHandler.Handle(request, CancellationToken.None);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.Equal(NivelRiesgoCrediticio.Bajo, result.NivelRiesgo);
        await _transUnionMock.Received(1).ConsultarHistorialAsync(Arg.Any<string>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CreditCheck_NoConsentRecord_ReturnsIsSuccessFalse()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var projectId = Guid.NewGuid();
        var request = new ConsultarCreditoCommand { ProyectoId = projectId, UsuarioId = userId };

        var project = new Proyecto("Test Project", "Location", userId);
        var developer = new Usuario("Test", "User", "test@test.com", "809", Domain.Enums.UserRole.User, "123456789", "hash");
        typeof(Domain.Common.EntityBase).GetProperty("Id")?.SetValue(developer, userId);

        _proyectoRepoMock.GetByIdAsync(projectId, Arg.Any<CancellationToken>()).Returns(project);
        _usuarioRepoMock.GetByIdAsync(userId, Arg.Any<CancellationToken>()).Returns(developer);
        
        _consentRepoMock.GetVigenteByUsuarioIdAsync(userId, Arg.Any<CancellationToken>())
            .Returns(Task.FromResult<ConsentimientoFinanciero?>(null)); // No consent

        // Act
        var result = await _creditHandler.Handle(request, CancellationToken.None);

        // Assert
        Assert.False(result.IsSuccess);
        Assert.Contains("No existe un consentimiento", result.Mensaje);
        await _transUnionMock.DidNotReceive().ConsultarHistorialAsync(Arg.Any<string>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public void RevokeConsent_SetsIsRevokedTrue_DoesNotDeleteRow()
    {
        // Arrange
        var consent = new ConsentimientoFinanciero(Guid.NewGuid(), "127.0.0.1", "v1.0", 30);
        
        // Act
        consent.Revocar();

        // Assert
        Assert.Equal(EstadoConsentimiento.Revocado, consent.Estado);
        Assert.NotEqual(default, consent.UpdatedAtUtc);
    }
}
