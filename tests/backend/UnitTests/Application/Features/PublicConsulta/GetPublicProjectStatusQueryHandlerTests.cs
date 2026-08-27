namespace UnitTests.Application.Features.PublicConsulta;

using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using global::Application.Abstractions;
using global::Application.Abstractions.Persistence;
using global::Application.Contracts.Documents;
using global::Application.DTOs.Documents;
using global::Application.Features.PublicConsulta.Queries.GetPublicProjectStatus;
using Domain.Entities;
using Domain.Enums;
using Moq;
using Xunit;

public class GetPublicProjectStatusQueryHandlerTests
{
    private readonly Mock<ISelloIntegridadRepository> _selloRepositoryMock;
    private readonly Mock<IProyectoRepository> _proyectoRepositoryMock;
    private readonly Mock<IValidacionRepository> _validacionRepositoryMock;
    private readonly Mock<IAuditLogger> _auditLoggerMock;
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly Mock<IDocumentService> _documentServiceMock;
    private readonly GetPublicProjectStatusQueryHandler _handler;

    public GetPublicProjectStatusQueryHandlerTests()
    {
        _selloRepositoryMock = new Mock<ISelloIntegridadRepository>();
        _proyectoRepositoryMock = new Mock<IProyectoRepository>();
        _validacionRepositoryMock = new Mock<IValidacionRepository>();
        _auditLoggerMock = new Mock<IAuditLogger>();
        _unitOfWorkMock = new Mock<IUnitOfWork>();
        _documentServiceMock = new Mock<IDocumentService>();

        _handler = new GetPublicProjectStatusQueryHandler(
            _selloRepositoryMock.Object,
            _proyectoRepositoryMock.Object,
            _validacionRepositoryMock.Object,
            _auditLoggerMock.Object,
            _unitOfWorkMock.Object,
            _documentServiceMock.Object
        );
    }

    [Fact]
    public async Task Handle_WithQrToken_IncrementsAccessCountFromOneToThreeVisits()
    {
        // Arrange
        var projectId = Guid.NewGuid();
        var qrToken = "secure-qr-token-12345";
        var seal = new SelloIntegridad(
            projectId,
            "VERIFINCA-20260827-B195C6A0",
            "Sello Bronce",
            NivelSelloIntegridad.Bronce,
            "https://test.com/qr",
            "mock-signature",
            qrToken
        );

        Assert.Equal(0, seal.ContadorAccesos);

        var proyecto = new Proyecto("Residencial Vista Real", "Santo Domingo", Guid.NewGuid(), 16);

        _selloRepositoryMock.Setup(r => r.GetByQrTokenAsync(qrToken, It.IsAny<CancellationToken>()))
            .ReturnsAsync(seal);
        _proyectoRepositoryMock.Setup(r => r.GetByIdAsync(projectId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(proyecto);
        _validacionRepositoryMock.Setup(r => r.GetByProyectoIdAsync(projectId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Validacion>());
        _documentServiceMock.Setup(r => r.GetProjectDocumentsAsync(projectId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<DocumentDto>());

        var query = new GetPublicProjectStatusQuery { QrToken = qrToken };

        // Act & Assert: Visit 1
        var result1 = await _handler.Handle(query, CancellationToken.None);
        Assert.NotNull(result1);
        Assert.Equal(1, seal.ContadorAccesos);

        // Act & Assert: Visit 2
        var result2 = await _handler.Handle(query, CancellationToken.None);
        Assert.NotNull(result2);
        Assert.Equal(2, seal.ContadorAccesos);

        // Act & Assert: Visit 3
        var result3 = await _handler.Handle(query, CancellationToken.None);
        Assert.NotNull(result3);
        Assert.Equal(3, seal.ContadorAccesos);

        _selloRepositoryMock.Verify(r => r.Update(seal), Times.Exactly(3));
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Exactly(3));
    }
}
