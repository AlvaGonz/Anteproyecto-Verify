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
using global::Application.Contracts.Documents;

public class DocumentServiceTests
{
    private readonly Mock<IDocumentoRepository> _documentoRepositoryMock;
    private readonly Mock<IProyectoRepository> _proyectoRepositoryMock;
    private readonly Mock<IUsuarioRepository> _usuarioRepositoryMock;
    private readonly Mock<IBlobStorageService> _blobStorageServiceMock;
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly Mock<IDocumentValidationService> _documentValidationServiceMock;
    private readonly Mock<IValidacionRepository> _validacionRepositoryMock;
    private readonly Mock<IAuditoriaRepository> _auditoriaRepositoryMock;
    private readonly Mock<global::Application.Abstractions.Ocr.IOcrProvider> _ocrProviderMock;
    private readonly Mock<global::Application.Services.DocumentProcessing.IDocumentStateEngine> _documentStateEngineMock;
    private readonly DocumentService _documentService;

    public DocumentServiceTests()
    {
        _documentoRepositoryMock = new Mock<IDocumentoRepository>();
        _proyectoRepositoryMock = new Mock<IProyectoRepository>();
        _usuarioRepositoryMock = new Mock<IUsuarioRepository>();
        _blobStorageServiceMock = new Mock<IBlobStorageService>();
        _unitOfWorkMock = new Mock<IUnitOfWork>();
        _documentValidationServiceMock = new Mock<IDocumentValidationService>();
        _validacionRepositoryMock = new Mock<IValidacionRepository>();
        _auditoriaRepositoryMock = new Mock<IAuditoriaRepository>();
        _ocrProviderMock = new Mock<global::Application.Abstractions.Ocr.IOcrProvider>();
        _documentStateEngineMock = new Mock<global::Application.Services.DocumentProcessing.IDocumentStateEngine>();

        _documentService = new DocumentService(
            _documentoRepositoryMock.Object,
            _proyectoRepositoryMock.Object,
            _usuarioRepositoryMock.Object,
            _blobStorageServiceMock.Object,
            _unitOfWorkMock.Object,
            _documentValidationServiceMock.Object,
            _validacionRepositoryMock.Object,
            _auditoriaRepositoryMock.Object,
            _ocrProviderMock.Object,
            _documentStateEngineMock.Object
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

    [Fact]
    public async Task DocumentService_Upload_Computes_SHA256_And_Stores_Hash_In_Entity()
    {
        // Arrange
        var projectId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var project = new Proyecto("Test", "Loc", userId, ProjectCategory.Residencial);
        var usuario = new Usuario("Test", "User", "test@test.com", "hash", UserRole.Profesional, "123", "456");
        var plan = PlanSuscripcion.Create(Guid.NewGuid(), "Profesional", 0m, -1, -1, true, true, 2, 1024, true, true, true, true, true, true, "Comunidad", true);
        typeof(Usuario).GetProperty("Plan")!.SetValue(usuario, plan);
        
        var dto = new global::Application.DTOs.Documents.UploadDocumentDto(
            DocumentType.CertificadoTitulo,
            userId,
            DateTime.UtcNow,
            "Institucion",
            null
        );
        
        var fileContent = "%PDF-1.4 dummy pdf content";
        var fileBytes = System.Text.Encoding.UTF8.GetBytes(fileContent);
        using var stream = new System.IO.MemoryStream(fileBytes);
        
        // Expected hash for "dummy pdf content"
        using var sha256 = System.Security.Cryptography.SHA256.Create();
        var expectedHash = BitConverter.ToString(sha256.ComputeHash(fileBytes)).Replace("-", "").ToLowerInvariant();

        _proyectoRepositoryMock.Setup(r => r.GetByIdAsync(projectId, It.IsAny<CancellationToken>())).ReturnsAsync(project);
        _usuarioRepositoryMock.Setup(r => r.GetByIdWithPlanAsync(userId, It.IsAny<CancellationToken>())).ReturnsAsync(usuario);
        
        _documentValidationServiceMock.Setup(s => s.ValidateDocumentAsync(It.IsAny<System.IO.Stream>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new DocumentValidationResult { IsValid = true, ValidatedFieldsJson = "{}" });

        _blobStorageServiceMock.Setup(s => s.UploadAsync(It.IsAny<System.IO.Stream>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new UploadResult("blobName", "http://test/blob"));

        _ocrProviderMock.Setup(p => p.ProcessDocumentAsync(It.IsAny<System.IO.Stream>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new global::Application.Abstractions.Ocr.OcrResult { Success = true, RawJson = "{}" });

        Documento? savedDoc = null;
        _documentoRepositoryMock.Setup(r => r.AddAsync(It.IsAny<Documento>(), It.IsAny<CancellationToken>()))
            .Callback<Documento, CancellationToken>((d, c) => savedDoc = d);

        // Act
        var result = await _documentService.UploadDocumentAsync(projectId, dto, stream, "test.pdf", "application/pdf", fileBytes.Length);

        // Assert
        Assert.NotNull(savedDoc);
        Assert.Equal(expectedHash, savedDoc.HashSHA256);
        
        _documentStateEngineMock.Verify(e => e.ApplyOcrResult(savedDoc, It.IsAny<global::Application.Abstractions.Ocr.OcrResult>()), Times.Once);
    }
}
