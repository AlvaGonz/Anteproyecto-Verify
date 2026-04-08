namespace UnitTests.Application.Features.Validation.Commands;

using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using global::Application.Abstractions.Persistence;
using global::Application.Features.Validation.Commands.EvaluateDocumentFormality;
using Domain.Entities;
using Domain.Enums;
using Moq;
using Xunit;

public class EvaluateDocumentFormalityCommandHandlerTests
{
    private readonly Mock<IProyectoRepository> _proyectoRepositoryMock;
    private readonly Mock<IDocumentoRepository> _documentoRepositoryMock;
    private readonly Mock<IAuditoriaRepository> _auditoriaRepositoryMock;
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly EvaluateDocumentFormalityCommandHandler _handler;

    public EvaluateDocumentFormalityCommandHandlerTests()
    {
        _proyectoRepositoryMock = new Mock<IProyectoRepository>();
        _documentoRepositoryMock = new Mock<IDocumentoRepository>();
        _auditoriaRepositoryMock = new Mock<IAuditoriaRepository>();
        _unitOfWorkMock = new Mock<IUnitOfWork>();

        _handler = new EvaluateDocumentFormalityCommandHandler(
            _proyectoRepositoryMock.Object,
            _documentoRepositoryMock.Object,
            _auditoriaRepositoryMock.Object,
            _unitOfWorkMock.Object);
    }

    [Fact]
    public async Task Handle_ShouldEvaluateDocumentsAndReturnResults()
    {
        // Arrange
        var projectId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var project = new Proyecto("Test", "Loc", userId);
        
        var doc = new Documento(projectId, DocumentType.PlanoArquitectonico, "test.pdf", "test.pdf", "/path", "application/pdf", ".pdf", 100, userId, 1, DateTime.UtcNow.AddMonths(-1), "Inst");

        _proyectoRepositoryMock.Setup(x => x.GetByIdAsync(projectId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(project);
            
        _documentoRepositoryMock.Setup(x => x.GetByProyectoIdAsync(projectId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Documento> { doc });

        var command = new EvaluateDocumentFormalityCommand { ProyectoId = projectId, UsuarioId = userId };

        // Act
        var results = await _handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.NotNull(results);
        Assert.Single(results);
        Assert.Equal(DocumentFormalStatus.Vigente, results[0].FormalStatus);
        _documentoRepositoryMock.Verify(x => x.Update(It.IsAny<Documento>()), Times.Once);
        _unitOfWorkMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
