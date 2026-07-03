namespace UnitTests;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using global::Application.Abstractions.Persistence;
using global::Application.Features.Documents;
using Domain.Entities;
using Domain.Enums;
using Moq;
using Xunit;
using global::Application.Abstractions.Storage;
using global::Application.Abstractions.DocumentIntelligence;

public class DocumentServiceTests
{
    private readonly Mock<IDocumentoRepository> _documentoRepositoryMock;
    private readonly Mock<IProyectoRepository> _proyectoRepositoryMock;
    private readonly Mock<IBlobStorageService> _blobStorageServiceMock;
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly Mock<IDocumentValidationService> _documentValidationServiceMock;
    private readonly Mock<IValidacionRepository> _validacionRepositoryMock;
    private readonly Mock<IAuditoriaRepository> _auditoriaRepositoryMock;
    private readonly DocumentService _documentService;

    public DocumentServiceTests()
    {
        _documentoRepositoryMock = new Mock<IDocumentoRepository>();
        _proyectoRepositoryMock = new Mock<IProyectoRepository>();
        _blobStorageServiceMock = new Mock<IBlobStorageService>();
        _unitOfWorkMock = new Mock<IUnitOfWork>();
        _documentValidationServiceMock = new Mock<IDocumentValidationService>();
        _validacionRepositoryMock = new Mock<IValidacionRepository>();
        _auditoriaRepositoryMock = new Mock<IAuditoriaRepository>();

        _documentService = new DocumentService(
            _documentoRepositoryMock.Object,
            _proyectoRepositoryMock.Object,
            new Mock<IUsuarioRepository>().Object,
            _blobStorageServiceMock.Object,
            _unitOfWorkMock.Object,
            _documentValidationServiceMock.Object,
            _validacionRepositoryMock.Object,
            _auditoriaRepositoryMock.Object
        );
    }

    [Fact]
    public async Task GetRequiredDocumentsAsync_ShouldReturnDocuments_BasedOnCategory()
    {
        // Arrange
        var projectId = Guid.NewGuid();
        var project = new Proyecto("Test", "Loc", Guid.NewGuid(), ProjectCategory.Comercial);
        
        _proyectoRepositoryMock.Setup(r => r.GetByIdAsync(projectId, It.IsAny<CancellationToken>())).ReturnsAsync(project);

        // Act
        var result = await _documentService.GetRequiredDocumentsAsync(projectId);

        // Assert
        Assert.NotNull(result);
        Assert.Contains(result, d => d.TipoDocumento == DocumentType.EstadosFinancieros);
        Assert.Contains(result, d => d.TipoDocumento == DocumentType.CertificadoEIA);
    }

    [Fact]
    public async Task GetProjectDiagnosticAsync_ShouldCalculatePercentage()
    {
        // Arrange
        var projectId = Guid.NewGuid();
        var project = new Proyecto("Test", "Loc", Guid.NewGuid(), ProjectCategory.Residencial);
        
        var docs = new List<Documento>
        {
            new Documento(projectId, DocumentType.CertificadoTitulo, "test.pdf", "test.pdf", "url", "application/pdf", ".pdf", 100, Guid.NewGuid()),
            new Documento(projectId, DocumentType.CertificacionEstadoJuridico, "test2.pdf", "test2.pdf", "url", "application/pdf", ".pdf", 100, Guid.NewGuid())
        };
        docs[0].UpdateStatus(DocumentStatus.Valid);
        docs[1].UpdateStatus(DocumentStatus.Invalid);

        _proyectoRepositoryMock.Setup(r => r.GetByIdAsync(projectId, It.IsAny<CancellationToken>())).ReturnsAsync(project);
        _documentoRepositoryMock.Setup(r => r.GetByProyectoIdAsync(projectId, It.IsAny<CancellationToken>())).ReturnsAsync(docs);

        // Act
        var result = await _documentService.GetProjectDiagnosticAsync(projectId);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Incompleto", result.EstadoGeneral);
        Assert.True(result.PorcentajeCompletitud > 0 && result.PorcentajeCompletitud < 100);
        
        var tituloDiagnostic = result.Documentos.First(d => d.TipoDocumento == DocumentType.CertificadoTitulo);
        Assert.Equal("Presente", tituloDiagnostic.Estado);

        var estadoJuridicoDiagnostic = result.Documentos.First(d => d.TipoDocumento == DocumentType.CertificacionEstadoJuridico);
        Assert.Equal("Incompleto", estadoJuridicoDiagnostic.Estado);
    }
}
