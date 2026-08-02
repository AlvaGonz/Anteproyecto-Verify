namespace UnitTests.Application.Features.Validation.Commands;

using System;
using System.Threading;
using System.Threading.Tasks;
using global::Application.Abstractions.Notifications;
using global::Application.Abstractions.Persistence;
using global::Application.Features.Validation.Commands.GenerateAlerta;
using Domain.Entities;
using Domain.Enums;
using Moq;
using Xunit;

public class GenerateAlertaCommandHandlerTests
{
    private readonly Mock<IAlertaValidacionRepository> _alertaRepositoryMock;
    private readonly Mock<IProyectoRepository> _proyectoRepositoryMock;
    private readonly Mock<IEmailNotificationService> _emailServiceMock;
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly GenerateAlertaCommandHandler _handler;

    public GenerateAlertaCommandHandlerTests()
    {
        _alertaRepositoryMock = new Mock<IAlertaValidacionRepository>();
        _proyectoRepositoryMock = new Mock<IProyectoRepository>();
        _emailServiceMock = new Mock<IEmailNotificationService>();
        _unitOfWorkMock = new Mock<IUnitOfWork>();

        _handler = new GenerateAlertaCommandHandler(
            _alertaRepositoryMock.Object,
            _proyectoRepositoryMock.Object,
            _emailServiceMock.Object,
            _unitOfWorkMock.Object);
    }

    [Fact]
    public async Task Handle_ShouldGenerateAlertaAndSendEmailIfCritica()
    {
        // Arrange
        var projectId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var project = new Proyecto("Test", "Loc", userId, 16);
        
        _proyectoRepositoryMock.Setup(x => x.GetByIdAsync(projectId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(project);

        var command = new GenerateAlertaCommand 
        { 
            ProyectoId = projectId, 
            UsuarioId = userId,
            Type = AlertType.Critica,
            Category = AlertCategory.DuplicidadRegistral,
            Titulo = "Test Alert",
            Descripcion = "Desc",
            NivelRiesgo = "Alto"
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(AlertType.Critica, result.Type);
        _alertaRepositoryMock.Verify(x => x.AddAsync(It.IsAny<AlertaValidacion>(), It.IsAny<CancellationToken>()), Times.Once);
        _emailServiceMock.Verify(x => x.SendCriticalAlertAsync(It.IsAny<string>(), It.IsAny<AlertaValidacion>(), It.IsAny<CancellationToken>()), Times.Once);
        _unitOfWorkMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}

