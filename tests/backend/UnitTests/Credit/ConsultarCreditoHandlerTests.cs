namespace UnitTests.Application.Features.Credit.Commands;

using System;
using System.Threading;
using System.Threading.Tasks;
using global::Application.Abstractions.ExternalServices.Credit;
using global::Application.Abstractions.Persistence;
using global::Application.Features.Credit.Commands.ConsultarCredito;
using Domain.Entities;
using Domain.Enums;
using Moq;
using Xunit;

public class ConsultarCreditoCommandHandlerTests
{
    private readonly Mock<IProyectoRepository> _proyectoRepositoryMock;
    private readonly Mock<IUsuarioRepository> _usuarioRepositoryMock;
    private readonly Mock<IConsentimientoRepository> _consentimientoRepositoryMock;
    private readonly Mock<IResultadoCrediticioRepository> _resultadoCrediticioRepositoryMock;
    private readonly Mock<ITransUnionService> _transUnionServiceMock;
    private readonly Mock<IHallazgoRepository> _hallazgoRepositoryMock;
    private readonly Mock<IAuditoriaRepository> _auditoriaRepositoryMock;
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly ConsultarCreditoCommandHandler _handler;

    public ConsultarCreditoCommandHandlerTests()
    {
        _proyectoRepositoryMock = new Mock<IProyectoRepository>();
        _usuarioRepositoryMock = new Mock<IUsuarioRepository>();
        _consentimientoRepositoryMock = new Mock<IConsentimientoRepository>();
        _resultadoCrediticioRepositoryMock = new Mock<IResultadoCrediticioRepository>();
        _transUnionServiceMock = new Mock<ITransUnionService>();
        _hallazgoRepositoryMock = new Mock<IHallazgoRepository>();
        _auditoriaRepositoryMock = new Mock<IAuditoriaRepository>();
        _unitOfWorkMock = new Mock<IUnitOfWork>();

        _handler = new ConsultarCreditoCommandHandler(
            _proyectoRepositoryMock.Object,
            _usuarioRepositoryMock.Object,
            _consentimientoRepositoryMock.Object,
            _resultadoCrediticioRepositoryMock.Object,
            _transUnionServiceMock.Object,
            _hallazgoRepositoryMock.Object,
            _auditoriaRepositoryMock.Object,
            _unitOfWorkMock.Object);
    }

    [Fact]
    public async Task Handle_ShouldFail_WhenNoConsentimientoVigente()
    {
        // Arrange
        var projectId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        
        var promotor = new Usuario("Promotor", "LastName", "promotor@test.com", "123", UserRole.User, "8095551212", "40200000000");
        var promotorId = promotor.Id;
        var project = new Proyecto("Test", "Loc", promotorId);
        
        _proyectoRepositoryMock.Setup(x => x.GetByIdAsync(projectId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(project);
        _usuarioRepositoryMock.Setup(x => x.GetByIdAsync(promotorId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(promotor);
        _consentimientoRepositoryMock.Setup(x => x.GetVigenteByUsuarioIdAsync(promotorId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((ConsentimientoFinanciero?)null);

        var command = new ConsultarCreditoCommand { ProyectoId = projectId, UsuarioId = userId };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.False(result.IsSuccess);
        Assert.Equal("No existe un consentimiento financiero vigente para el promotor.", result.Mensaje);
        _transUnionServiceMock.Verify(x => x.ConsultarHistorialAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_ShouldGenerateHallazgo_WhenRiesgoAlto()
    {
        // Arrange
        var projectId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        
        var promotor = new Usuario("Promotor", "LastName", "promotor@test.com", "123", UserRole.User, "8095551212", "40200000000");
        var promotorId = promotor.Id;
        var project = new Proyecto("Test", "Loc", promotorId);
        var consentimiento = new ConsentimientoFinanciero(promotorId, "1.1.1.1", "v1.0");
        
        _proyectoRepositoryMock.Setup(x => x.GetByIdAsync(projectId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(project);
        _usuarioRepositoryMock.Setup(x => x.GetByIdAsync(promotorId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(promotor);
        _consentimientoRepositoryMock.Setup(x => x.GetVigenteByUsuarioIdAsync(promotorId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(consentimiento);

        _transUnionServiceMock.Setup(x => x.ConsultarHistorialAsync(promotor.Identificacion, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new TransUnionResult { IsSuccess = true, NivelRiesgo = NivelRiesgoCrediticio.Alto });

        var command = new ConsultarCreditoCommand { ProyectoId = projectId, UsuarioId = userId };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.Equal(NivelRiesgoCrediticio.Alto, result.NivelRiesgo);
        _resultadoCrediticioRepositoryMock.Verify(x => x.AddAsync(It.IsAny<ResultadoCrediticio>(), It.IsAny<CancellationToken>()), Times.Once);
        _hallazgoRepositoryMock.Verify(x => x.AddAsync(It.IsAny<Hallazgo>(), It.IsAny<CancellationToken>()), Times.Once);
    }
}

