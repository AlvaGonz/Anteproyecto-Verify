using System;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Persistence;
using Application.Abstractions.Reports;
using Application.Abstractions.Services.Crypto;
using Application.Features.Sello.Commands.EmitirSello;
using Domain.Entities;
using Domain.Enums;
using NSubstitute;
using Xunit;

namespace Api.Tests.Seal;

public class IntegritySealGuardTests
{
    private readonly IProyectoRepository _proyectoRepoMock;
    private readonly ISelloIntegridadRepository _selloRepoMock;
    private readonly IReporteBuilder _reporteBuilderMock;
    private readonly IFirmaDigitalService _firmaDigitalMock;
    private readonly IQrGeneratorService _qrGeneratorMock;
    private readonly IAuditoriaRepository _auditoriaRepoMock;
    private readonly IUnitOfWork _uowMock;
    private readonly EmitirSelloCommandHandler _handler;

    public IntegritySealGuardTests()
    {
        _proyectoRepoMock = Substitute.For<IProyectoRepository>();
        _selloRepoMock = Substitute.For<ISelloIntegridadRepository>();
        _reporteBuilderMock = Substitute.For<IReporteBuilder>();
        _firmaDigitalMock = Substitute.For<IFirmaDigitalService>();
        _qrGeneratorMock = Substitute.For<IQrGeneratorService>();
        _auditoriaRepoMock = Substitute.For<IAuditoriaRepository>();
        _uowMock = Substitute.For<IUnitOfWork>();

        _handler = new EmitirSelloCommandHandler(
            _proyectoRepoMock,
            _selloRepoMock,
            _reporteBuilderMock,
            _firmaDigitalMock,
            _qrGeneratorMock,
            _auditoriaRepoMock,
            _uowMock
        );
    }

    [Fact]
    public async Task IssueSeal_IncompleteValidation_ReturnsIsSuccessFalse()
    {
        // Arrange
        var projectId = Guid.NewGuid();
        var request = new EmitirSelloCommand { ProyectoId = projectId };
        
        var project = new Proyecto("Test Project", "Location", Guid.NewGuid());
        typeof(Domain.Common.EntityBase).GetProperty("Id")?.SetValue(project, projectId);

        _proyectoRepoMock.GetByIdAsync(projectId, Arg.Any<CancellationToken>()).Returns(project);
        
        _selloRepoMock.GetByProyectoIdAsync(projectId, Arg.Any<CancellationToken>())
            .Returns(Task.FromResult<SelloIntegridad?>(null));

        var reporte = new ReporteHallazgosDto { EsAptoParaSello = false };
        _reporteBuilderMock.BuildReporteAsync(projectId, Arg.Any<CancellationToken>()).Returns(reporte);

        // Act
        var result = await _handler.Handle(request, CancellationToken.None);

        // Assert
        Assert.False(result.IsSuccess);
        Assert.Contains("El proyecto no es apto para el sello", result.Mensaje);
        await _selloRepoMock.DidNotReceive().AddAsync(Arg.Any<SelloIntegridad>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task IssueSeal_HasCriticalFindings_ReturnsIsSuccessFalse()
    {
        // Arrange
        var projectId = Guid.NewGuid();
        var request = new EmitirSelloCommand { ProyectoId = projectId };
        
        var project = new Proyecto("Test Project", "Location", Guid.NewGuid());
        typeof(Domain.Common.EntityBase).GetProperty("Id")?.SetValue(project, projectId);

        _proyectoRepoMock.GetByIdAsync(projectId, Arg.Any<CancellationToken>()).Returns(project);
        
        _selloRepoMock.GetByProyectoIdAsync(projectId, Arg.Any<CancellationToken>())
            .Returns(Task.FromResult<SelloIntegridad?>(null));

        var reporte = new ReporteHallazgosDto { EsAptoParaSello = false, HallazgosCriticos = 1 };
        _reporteBuilderMock.BuildReporteAsync(projectId, Arg.Any<CancellationToken>()).Returns(reporte);

        // Act
        var result = await _handler.Handle(request, CancellationToken.None);

        // Assert
        Assert.False(result.IsSuccess);
        Assert.Contains("El proyecto no es apto para el sello", result.Mensaje);
        await _selloRepoMock.DidNotReceive().AddAsync(Arg.Any<SelloIntegridad>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task IssueSeal_SealAlreadyExistsAndActive_ReturnsIsSuccessFalse()
    {
        // Arrange
        var projectId = Guid.NewGuid();
        var request = new EmitirSelloCommand { ProyectoId = projectId };
        
        var project = new Proyecto("Test Project", "Location", Guid.NewGuid());
        typeof(Domain.Common.EntityBase).GetProperty("Id")?.SetValue(project, projectId);

        _proyectoRepoMock.GetByIdAsync(projectId, Arg.Any<CancellationToken>()).Returns(project);
        
        var existingSeal = new SelloIntegridad(projectId, "CODE", "Bronce", NivelSelloIntegridad.Bronce, "url", "sign");
        _selloRepoMock.GetByProyectoIdAsync(projectId, Arg.Any<CancellationToken>()).Returns(existingSeal);

        // Act
        var result = await _handler.Handle(request, CancellationToken.None);

        // Assert
        Assert.False(result.IsSuccess);
        Assert.Contains("El proyecto ya cuenta con un sello de integridad vigente", result.Mensaje);
        await _selloRepoMock.DidNotReceive().AddAsync(Arg.Any<SelloIntegridad>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task IssueSeal_AllChecksPass_GeneratesSealWithSignature()
    {
        // Arrange
        var projectId = Guid.NewGuid();
        var request = new EmitirSelloCommand { ProyectoId = projectId };
        
        var project = new Proyecto("Test Project", "Location", Guid.NewGuid());
        typeof(Domain.Common.EntityBase).GetProperty("Id")?.SetValue(project, projectId);

        _proyectoRepoMock.GetByIdAsync(projectId, Arg.Any<CancellationToken>()).Returns(project);
        
        _selloRepoMock.GetByProyectoIdAsync(projectId, Arg.Any<CancellationToken>())
            .Returns(Task.FromResult<SelloIntegridad?>(null));

        var reporte = new ReporteHallazgosDto { EsAptoParaSello = true };
        _reporteBuilderMock.BuildReporteAsync(projectId, Arg.Any<CancellationToken>()).Returns(reporte);

        _firmaDigitalMock.FirmarDatosAsync(Arg.Any<string>(), Arg.Any<CancellationToken>()).Returns("digital-signature");
        _qrGeneratorMock.GenerarQrUrlAsync(Arg.Any<string>(), Arg.Any<CancellationToken>()).Returns("http://qr.com");

        // Act
        var result = await _handler.Handle(request, CancellationToken.None);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.NotNull(result.CodigoSello);
        Assert.Equal("http://qr.com", result.UrlQr);
        
        await _selloRepoMock.Received(1).AddAsync(Arg.Is<SelloIntegridad>(s => 
            s.ProyectoId == projectId && 
            s.FirmaDigital == "digital-signature" &&
            s.UrlQr == "http://qr.com"), Arg.Any<CancellationToken>());
    }
}
