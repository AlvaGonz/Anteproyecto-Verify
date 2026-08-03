namespace UnitTests;

using System;
using System.Threading;
using System.Threading.Tasks;
using global::Application.Abstractions.Integrations;
using global::Application.Abstractions.Persistence;
using global::Application.DTOs.Integrations;
using global::Application.Features.Validations.Commands.InitiateDgriValidation;
using Domain.Entities;
using Domain.Enums;
using Moq;
using Xunit;

public class InitiateDgriValidationCommandHandlerTests
{
    private readonly Mock<IDgriService> _dgriServiceMock;
    private readonly Mock<IProyectoRepository> _proyectoRepositoryMock;
    private readonly Mock<IUsuarioRepository> _usuarioRepositoryMock;
    private readonly Mock<IValidacionRepository> _validacionRepositoryMock;
    private readonly Mock<IAuditoriaRepository> _auditoriaRepositoryMock;
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly InitiateDgriValidationCommandHandler _handler;

    public InitiateDgriValidationCommandHandlerTests()
    {
        _dgriServiceMock = new Mock<IDgriService>();
        _proyectoRepositoryMock = new Mock<IProyectoRepository>();
        _usuarioRepositoryMock = new Mock<IUsuarioRepository>();
        _validacionRepositoryMock = new Mock<IValidacionRepository>();
        _auditoriaRepositoryMock = new Mock<IAuditoriaRepository>();
        _unitOfWorkMock = new Mock<IUnitOfWork>();

        _handler = new InitiateDgriValidationCommandHandler(
            _dgriServiceMock.Object,
            _proyectoRepositoryMock.Object,
            _usuarioRepositoryMock.Object,
            _validacionRepositoryMock.Object,
            _auditoriaRepositoryMock.Object,
            _unitOfWorkMock.Object
        );
    }

    [Fact]
    public async Task Handle_ShouldUpdateProjectStatus_WhenDgriReturnsValid()
    {
        // Arrange
        var projectId = Guid.NewGuid();
        var project = new Proyecto("Test", "Loc", Guid.NewGuid(), 16);
        
        _proyectoRepositoryMock.Setup(r => r.GetByIdAsync(projectId, It.IsAny<CancellationToken>())).ReturnsAsync(project);
        
        _dgriServiceMock.Setup(s => s.ConsultarEstadoJuridicoAsync(It.IsAny<Guid>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new DgriResponseDto
            {
                IsSuccess = true,
                Vigencia = "Vigente",
                TieneCargasJuridicas = false
            });

        var user = new Usuario("Test", "User", "test@test.com", "hash", UserRole.Administrator, "123", "40200000000");
        _usuarioRepositoryMock.Setup(r => r.GetByIdWithPlanAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>())).ReturnsAsync(user);

        var command = new InitiateDgriValidationCommand { ProyectoId = projectId, DatosRegistrales = "123", UsuarioId = Guid.NewGuid() };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.True(result);
        Assert.Equal(EstadoJuridico.Valido, project.EstadoJuridico);
        _validacionRepositoryMock.Verify(r => r.AddAsync(It.Is<Validacion>(v => v.EsLegitimo == true), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_ShouldUpdateProjectStatusToConObservaciones_WhenDgriReturnsCargas()
    {
        // Arrange
        var projectId = Guid.NewGuid();
        var project = new Proyecto("Test", "Loc", Guid.NewGuid(), 16);
        
        _proyectoRepositoryMock.Setup(r => r.GetByIdAsync(projectId, It.IsAny<CancellationToken>())).ReturnsAsync(project);
        
        _dgriServiceMock.Setup(s => s.ConsultarEstadoJuridicoAsync(It.IsAny<Guid>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new DgriResponseDto
            {
                IsSuccess = true,
                Vigencia = "Vigente",
                TieneCargasJuridicas = true
            });

        var user = new Usuario("Test", "User", "test@test.com", "hash", UserRole.Administrator, "123", "40200000000");
        _usuarioRepositoryMock.Setup(r => r.GetByIdWithPlanAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>())).ReturnsAsync(user);

        var command = new InitiateDgriValidationCommand { ProyectoId = projectId, DatosRegistrales = "123", UsuarioId = Guid.NewGuid() };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.True(result);
        Assert.Equal(EstadoJuridico.ConObservaciones, project.EstadoJuridico);
        _validacionRepositoryMock.Verify(r => r.AddAsync(It.Is<Validacion>(v => v.EsLegitimo == false), It.IsAny<CancellationToken>()), Times.Once);
    }
}

