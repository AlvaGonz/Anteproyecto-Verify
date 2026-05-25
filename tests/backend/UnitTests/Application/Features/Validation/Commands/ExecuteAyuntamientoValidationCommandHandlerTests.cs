namespace UnitTests.Application.Features.Validation.Commands;

using System;
using System.Threading;
using System.Threading.Tasks;
using global::Application.Abstractions.ExternalServices;
using global::Application.Abstractions.Persistence;
using global::Application.DTOs.Validation;
using global::Application.Features.Validation.Commands.ExecuteAyuntamientoValidation;
using Domain.Entities;
using Domain.Enums;
using Moq;
using Xunit;

public class ExecuteAyuntamientoValidationCommandHandlerTests
{
    private readonly Mock<IAyuntamientoService> _ayuntamientoServiceMock;
    private readonly Mock<IProyectoRepository> _proyectoRepositoryMock;
    private readonly Mock<IValidacionAyuntamientoRepository> _validacionAyuntamientoRepositoryMock;
    private readonly Mock<IAuditoriaRepository> _auditoriaRepositoryMock;
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly ExecuteAyuntamientoValidationCommandHandler _handler;

    public ExecuteAyuntamientoValidationCommandHandlerTests()
    {
        _ayuntamientoServiceMock = new Mock<IAyuntamientoService>();
        _proyectoRepositoryMock = new Mock<IProyectoRepository>();
        _validacionAyuntamientoRepositoryMock = new Mock<IValidacionAyuntamientoRepository>();
        _auditoriaRepositoryMock = new Mock<IAuditoriaRepository>();
        _unitOfWorkMock = new Mock<IUnitOfWork>();
        _unitOfWorkMock.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);

        _handler = new ExecuteAyuntamientoValidationCommandHandler(
            _ayuntamientoServiceMock.Object,
            _proyectoRepositoryMock.Object,
            _validacionAyuntamientoRepositoryMock.Object,
            _auditoriaRepositoryMock.Object,
            _unitOfWorkMock.Object);
    }

    [Fact]
    public async Task Handle_ShouldCallAyuntamientoServiceAndSaveResult()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var project = new Proyecto("Test", "Santo Domingo", userId);
        var projectId = project.Id;
        
        _proyectoRepositoryMock.Setup(x => x.GetByIdAsync(projectId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(project);

        _ayuntamientoServiceMock.Setup(x => x.ConsultarLicenciasAsync("Santo Domingo", projectId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new AyuntamientoQueryResultDto { IsSuccess = true, Result = AyuntamientoValidationResult.Verificado });

        var command = new ExecuteAyuntamientoValidationCommand { ProyectoId = projectId, UsuarioId = userId };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.Equal(AyuntamientoValidationResult.Verificado, result.Result);
        _validacionAyuntamientoRepositoryMock.Verify(x => x.AddAsync(It.IsAny<ValidacionAyuntamiento>(), It.IsAny<CancellationToken>()), Times.Once);
        _unitOfWorkMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Exactly(2));
    }
}
