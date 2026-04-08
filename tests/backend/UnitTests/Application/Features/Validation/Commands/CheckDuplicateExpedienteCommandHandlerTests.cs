namespace UnitTests.Application.Features.Validation.Commands;

using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using global::Application.Abstractions.Persistence;
using global::Application.Features.Validation.Commands.CheckDuplicateExpediente;
using Domain.Entities;
using Domain.Enums;
using Moq;
using Xunit;

public class CheckDuplicateExpedienteCommandHandlerTests
{
    private readonly Mock<IProyectoRepository> _proyectoRepositoryMock;
    private readonly Mock<IDeteccionDuplicidadRepository> _deteccionRepositoryMock;
    private readonly Mock<IAuditoriaRepository> _auditoriaRepositoryMock;
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly CheckDuplicateExpedienteCommandHandler _handler;

    public CheckDuplicateExpedienteCommandHandlerTests()
    {
        _proyectoRepositoryMock = new Mock<IProyectoRepository>();
        _deteccionRepositoryMock = new Mock<IDeteccionDuplicidadRepository>();
        _auditoriaRepositoryMock = new Mock<IAuditoriaRepository>();
        _unitOfWorkMock = new Mock<IUnitOfWork>();

        _handler = new CheckDuplicateExpedienteCommandHandler(
            _proyectoRepositoryMock.Object,
            _deteccionRepositoryMock.Object,
            _auditoriaRepositoryMock.Object,
            _unitOfWorkMock.Object);
    }

    [Fact]
    public async Task Handle_ShouldReturnNinguno_WhenNoDuplicatesFound()
    {
        // Arrange
        var projectId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var project = new Proyecto("Test", "Loc", userId);
        project.UpdateRncYMatricula("123", "MAT-123");
        
        _proyectoRepositoryMock.Setup(x => x.GetByIdAsync(projectId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(project);
            
        _proyectoRepositoryMock.Setup(x => x.GetVisibleAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Proyecto> { project });

        var command = new CheckDuplicateExpedienteCommand { ProyectoId = projectId, UsuarioId = userId };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(DuplicityRiskLevel.Ninguno, result.NivelRiesgo);
        Assert.False(result.Bloqueante);
        _deteccionRepositoryMock.Verify(x => x.AddAsync(It.IsAny<DeteccionDuplicidad>(), It.IsAny<CancellationToken>()), Times.Once);
        _unitOfWorkMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Exactly(2));
    }
}
