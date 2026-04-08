namespace UnitTests.Application.Features.Validation.Commands;

using System;
using System.Threading;
using System.Threading.Tasks;
using global::Application.Abstractions.ExternalServices;
using global::Application.Abstractions.Persistence;
using global::Application.DTOs.Validation;
using global::Application.Features.Validation.Commands.ExecuteDgiiValidation;
using Domain.Entities;
using Domain.Enums;
using Moq;
using Xunit;

public class ExecuteDgiiValidationCommandHandlerTests
{
    private readonly Mock<IDgiiValidationService> _dgiiServiceMock;
    private readonly Mock<IProyectoRepository> _proyectoRepositoryMock;
    private readonly Mock<IValidacionDgiiRepository> _validacionDgiiRepositoryMock;
    private readonly Mock<IAuditoriaRepository> _auditoriaRepositoryMock;
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly ExecuteDgiiValidationCommandHandler _handler;

    public ExecuteDgiiValidationCommandHandlerTests()
    {
        _dgiiServiceMock = new Mock<IDgiiValidationService>();
        _proyectoRepositoryMock = new Mock<IProyectoRepository>();
        _validacionDgiiRepositoryMock = new Mock<IValidacionDgiiRepository>();
        _auditoriaRepositoryMock = new Mock<IAuditoriaRepository>();
        _unitOfWorkMock = new Mock<IUnitOfWork>();

        _handler = new ExecuteDgiiValidationCommandHandler(
            _dgiiServiceMock.Object,
            _proyectoRepositoryMock.Object,
            _validacionDgiiRepositoryMock.Object,
            _auditoriaRepositoryMock.Object,
            _unitOfWorkMock.Object);
    }

    [Fact]
    public async Task Handle_ShouldReturnError_WhenRncIsMissing()
    {
        // Arrange
        var projectId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var project = new Proyecto("Test", "Loc", userId);
        
        _proyectoRepositoryMock.Setup(x => x.GetByIdAsync(projectId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(project);

        var command = new ExecuteDgiiValidationCommand { ProyectoId = projectId, UsuarioId = userId };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.False(result.IsSuccess);
        Assert.Equal("RNC no especificado en el proyecto.", result.ErrorMessage);
    }

    [Fact]
    public async Task Handle_ShouldCallDgiiServiceAndSaveResult_WhenRncIsPresent()
    {
        // Arrange
        var projectId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var project = new Proyecto("Test", "Loc", userId);
        project.UpdateRncYMatricula("123456789", null);
        
        _proyectoRepositoryMock.Setup(x => x.GetByIdAsync(projectId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(project);

        _dgiiServiceMock.Setup(x => x.ConsultarRncAsync("123456789", It.IsAny<CancellationToken>()))
            .ReturnsAsync(new DgiiValidationResultDto { IsSuccess = true, Rnc = "123456789", Status = DgiiStatus.Activo });

        var command = new ExecuteDgiiValidationCommand { ProyectoId = projectId, UsuarioId = userId };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.True(result.IsSuccess);
        _validacionDgiiRepositoryMock.Verify(x => x.AddAsync(It.IsAny<ValidacionDgii>(), It.IsAny<CancellationToken>()), Times.Once);
        _unitOfWorkMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Exactly(2));
    }
}
