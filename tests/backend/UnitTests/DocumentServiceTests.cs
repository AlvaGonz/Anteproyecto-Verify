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
using global::Application.Contracts.Geo;

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
    private readonly Mock<IGeoResolutionService> _geoResolutionServiceMock;
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
        _geoResolutionServiceMock = new Mock<IGeoResolutionService>();

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
            _documentStateEngineMock.Object,
            _geoResolutionServiceMock.Object
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

    /// <summary>
    /// RED TEST: Reproduces the bug where EstadoJuridico documents do not get
    /// their geographic resolution (provinceResolution, municipalityResolution)
    /// populated during upload, leaving the Provincia/Municipio dropdowns
    /// empty in the UI. ApplyGeographicResolutionAsync is currently called only
    /// for CertificadoTitulo; the fix is to call it for EstadoJuridico too.
    ///</summary>
    [Theory]
    [InlineData(DocumentType.CertificacionEstadoJuridico, true)]   // Expected after fix
    [InlineData(DocumentType.CertificadoTitulo, true)]           // Already works
    [InlineData(DocumentType.PlanoMensuraCatastral, true)]       // Expected after fix
    public async Task UploadDocument_ShouldResolveGeography_ForAllTypesWithProvinciaMunicipio(
        DocumentType documentType, bool shouldCallResolver)
    {
        // Arrange
        var projectId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var project = new Proyecto("Test", "Loc", userId, ProjectCategory.Turistico);
        var usuario = new Usuario("Test", "User", "test@test.com", "hash", UserRole.Profesional, "123", "456");
        var plan = PlanSuscripcion.Create(Guid.NewGuid(), "Profesional", 0m, -1, -1, true, true, 2, 1024, true, true, true, true, true, true, "Comunidad", true);
        typeof(Usuario).GetProperty("Plan")!.SetValue(usuario, plan);

        var dto = new global::Application.DTOs.Documents.UploadDocumentDto(
            documentType,
            userId,
            DateTime.UtcNow,
            "Institucion",
            null
        );

        var fileContent = "%PDF-1.4 dummy pdf content";
        var fileBytes = System.Text.Encoding.UTF8.GetBytes(fileContent);
        using var stream = new System.IO.MemoryStream(fileBytes);

        _proyectoRepositoryMock.Setup(r => r.GetByIdAsync(projectId, It.IsAny<CancellationToken>())).ReturnsAsync(project);
        _usuarioRepositoryMock.Setup(r => r.GetByIdWithPlanAsync(userId, It.IsAny<CancellationToken>())).ReturnsAsync(usuario);

        _documentValidationServiceMock.Setup(s => s.ValidateDocumentAsync(It.IsAny<System.IO.Stream>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new DocumentValidationResult { IsValid = true, ValidatedFieldsJson = "{}" });

        _blobStorageServiceMock.Setup(s => s.UploadAsync(It.IsAny<System.IO.Stream>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new UploadResult("blobName", "http://test/blob"));

        // Mock OCR to return a canonical envelope with Provincia + Municipio so
        // ApplyGeographicResolutionAsync will trigger resolution. The envelopeType
        // below overrides documentType to match the upload type.
        _geoResolutionServiceMock.Setup(r => r.ResolveProvinciaAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new global::Application.Documents.Extractions.GeographicResolutionResult
            {
                RawValue = "TEST",
                NormalizedValue = "TEST",
                ResolvedId = Guid.NewGuid(),
                ResolutionMethod = "exact",
                Confidence = 0.9,
                AliasesMatched = new List<string>(),
                Warnings = new List<string>()
            });
        _geoResolutionServiceMock.Setup(r => r.ResolveMunicipioAsync(It.IsAny<string>(), It.IsAny<Guid?>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new global::Application.Documents.Extractions.GeographicResolutionResult
            {
                RawValue = "TEST",
                NormalizedValue = "TEST",
                ResolvedId = Guid.NewGuid(),
                ResolutionMethod = "exact",
                Confidence = 0.9,
                AliasesMatched = new List<string>(),
                Warnings = new List<string>()
            });

        Documento? savedDoc = null;
        _documentoRepositoryMock.Setup(r => r.AddAsync(It.IsAny<Documento>(), It.IsAny<CancellationToken>()))
            .Callback<Documento, CancellationToken>((d, c) => savedDoc = d);

        // Simulate DocumentStateEngine.ApplyOcrResult: write the OCR result back
        // to document.ResultadoOcrJson with the correct envelope documentType
        // matching the upload type, so ApplyGeographicResolutionAsync can read it.
        var envelopeType = documentType == DocumentType.CertificadoTitulo ? "CertificadoTitulo"
            : documentType == DocumentType.CertificacionEstadoJuridico ? "EstadoJuridico"
            : documentType == DocumentType.PlanoMensuraCatastral ? "PlanoMensuraCatastral"
            : "X";
        var envelopeJson = "{\"schemaVersion\":\"1.0\",\"documentType\":\"" + envelopeType + "\",\"payload\":{" +
            "\"oficina\":{\"rawValue\":\"X\",\"normalizedValue\":\"X\",\"confidence\":0.8,\"status\":0,\"sourcePage\":1}," +
            "\"provincia\":{\"rawValue\":\"LA ALTAGRACIA\",\"normalizedValue\":\"LA ALTAGRACIA\",\"confidence\":0.8,\"status\":0,\"sourcePage\":1}," +
            "\"municipio\":{\"rawValue\":\"HIGUEY\",\"normalizedValue\":\"HIGUEY\",\"confidence\":0.8,\"status\":0,\"sourcePage\":1}" +
            "}}";
        _ocrProviderMock.Setup(p => p.ProcessDocumentAsync(It.IsAny<System.IO.Stream>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new global::Application.Abstractions.Ocr.OcrResult
            {
                Success = true,
                RawJson = "{}",
                ExtractedText = "",
                CanonicalDataJson = envelopeJson
            });
        _documentStateEngineMock.Setup(s => s.ApplyOcrResult(It.IsAny<Documento>(), It.IsAny<global::Application.Abstractions.Ocr.OcrResult>()))
            .Callback<Documento, global::Application.Abstractions.Ocr.OcrResult>((d, o) =>
            {
                d.SetOcrResult(System.Text.Json.JsonSerializer.Serialize(o), DocumentStatus.Processing);
            });

        // Act
        await _documentService.UploadDocumentAsync(projectId, dto, stream, "test.pdf", "application/pdf", fileBytes.Length);

        // Assert
        Assert.NotNull(savedDoc);
        if (shouldCallResolver)
        {
            _geoResolutionServiceMock.Verify(
                r => r.ResolveProvinciaAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()),
                Times.AtLeastOnce,
                $"Expected ResolveProvinciaAsync to be called for {documentType} but it was not");

            // REGRESSION GUARD: the envelope documentType must NOT be overwritten to
            // "CertificadoTitulo" for EstadoJuridico / PlanoMensuraCatastral uploads.
            // Otherwise ProjectDocumentsController.MapToValidationDto will fail to
            // deserialize the payload into the right extraction record and the UI
            // dropdowns (Provincia / Municipio) will remain empty.
            var ocrJson = savedDoc.ResultadoOcrJson;
            Assert.False(string.IsNullOrEmpty(ocrJson));
            var ocrResult = System.Text.Json.JsonSerializer.Deserialize<global::Application.Abstractions.Ocr.OcrResult>(
                ocrJson,
                new System.Text.Json.JsonSerializerOptions { PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase });
            Assert.NotNull(ocrResult);
            Assert.False(string.IsNullOrEmpty(ocrResult.CanonicalDataJson));
            var envelope = System.Text.Json.JsonDocument.Parse(ocrResult.CanonicalDataJson);
            Assert.Equal(envelopeType, envelope.RootElement.GetProperty("documentType").GetString());

            // REGRESSION GUARD: the payload must be re-serialized using the same
            // extraction record type that was set by DocumentStateEngine.ApplyOcrResult.
            // For PlanoMensuraCatastral uploads the payload must NOT contain
            // CertificadoTitulo-specific fields (fechaYHoraInscripcion, vieneDe,
            // matricula, superficieM2) which would mean ApplyGeographicResolutionAsync
            // collapsed the payload to a CertificadoTituloRdExtractionV1 record.
            // Otherwise ProjectDocumentsController.MapToValidationDto deserializes
            // the payload as PlanoMensuraCatastralRdExtractionV1, all the actual
            // extracted fields (departamento, operacion, designacionCatastralPosicional,
            // designacionCatastralOrigen, seccion, lugar, superficieARegistrarParcelaM2)
            // are silently dropped, and the UI shows blank cards for every field.
            if (documentType == DocumentType.PlanoMensuraCatastral)
            {
                var payloadJson = envelope.RootElement.GetProperty("payload").GetRawText();
                Assert.False(payloadJson.Contains("fechaYHoraInscripcion"),
                    "Payload was re-serialized with CertificadoTitulo fields instead of PlanoMensuraCatastral fields");
                Assert.False(payloadJson.Contains("vieneDe"),
                    "Payload was re-serialized with CertificadoTitulo fields instead of PlanoMensuraCatastral fields");
                Assert.False(payloadJson.Contains("superficieM2"),
                    "Payload was re-serialized with CertificadoTitulo fields instead of PlanoMensuraCatastral fields");
            }
        }
        else
        {
            _geoResolutionServiceMock.Verify(
                r => r.ResolveProvinciaAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()),
                Times.Never,
                $"Did not expect ResolveProvinciaAsync to be called for {documentType}");
        }
    }
}
