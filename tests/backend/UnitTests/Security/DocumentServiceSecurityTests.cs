namespace UnitTests.Security;

using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using global::Application.Abstractions.DocumentIntelligence;
using global::Application.Abstractions.Notifications;
using global::Application.Abstractions.Ocr;
using global::Application.Abstractions.Persistence;
using global::Application.Abstractions.Storage;
using global::Application.Contracts.Documents;
using global::Application.Contracts.Geo;
using global::Application.DTOs.Documents;
using global::Application.Features.Documents;
using global::Application.Services.DocumentProcessing;
using global::Infrastructure.Storage;
using Domain.Entities;
using Domain.Enums;
using Moq;
using Xunit;

/// <summary>
/// RNF-3: al subir un documento a través de DocumentService con el Blob
/// Storage envuelto por el decorador AES-256, lo que se persiste debe ser
/// ciphertext — nunca el texto plano del PDF.
/// </summary>
public class DocumentServiceSecurityTests
{
    private sealed class CapturingBlobStorage : IBlobStorageService
    {
        public byte[] UploadedBytes { get; private set; } = Array.Empty<byte>();
        public string UploadedContentType { get; private set; } = string.Empty;
        public string UploadedFileName { get; private set; } = string.Empty;

        public Task<UploadResult> UploadAsync(Stream stream, string fileName, string contentType, CancellationToken cancellationToken = default)
        {
            UploadedFileName = fileName;
            UploadedContentType = contentType;
            using var ms = new MemoryStream();
            stream.CopyTo(ms);
            UploadedBytes = ms.ToArray();
            return Task.FromResult(new UploadResult(fileName, $"http://blob/{fileName}"));
        }

        public Task<(Stream Stream, string ContentType)> DownloadAsync(string blobName, CancellationToken cancellationToken = default)
            => Task.FromResult(((Stream)new MemoryStream(UploadedBytes), UploadedContentType));

        public Task<bool> ExistsAsync(string blobName, CancellationToken cancellationToken = default)
            => Task.FromResult(true);

        public Task DeleteAsync(string fileUrl, CancellationToken cancellationToken = default)
            => Task.CompletedTask;
    }

    [Fact]
    public async Task UploadDocumentAsync_Should_NotStorePlaintext_WhenBlobStorageIsAesWrapped()
    {
        // Arrange
        var projectId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var project = new Proyecto("Test", "Loc", userId, 16);
        var usuario = new Usuario("Test", "User", "test@test.com", "hash", UserRole.Profesional, "123", "456");
        var plan = PlanSuscripcion.Create(Guid.NewGuid(), "Profesional", 0m, -1, -1, true, true, 2, 1024, true, true, true, true, true, true, "Comunidad", true);
        typeof(Usuario).GetProperty("Plan")!.SetValue(usuario, plan);

        var dto = new UploadDocumentDto(DocumentType.CertificacionIPI, userId, DateTime.UtcNow, "DGII", null);
        var plaintext = System.Text.Encoding.UTF8.GetBytes("%PDF-1.4 cedula e IPI altamente confidencial");

        var inner = new CapturingBlobStorage();
        var aesKey = Enumerable.Range(0, 32).Select(i => (byte)(i + 1)).ToArray();
        var blobStorage = new AesEncryptingBlobStorageDecorator(inner, aesKey);

        var documentoRepo = new Mock<IDocumentoRepository>();
        var proyectoRepo = new Mock<IProyectoRepository>();
        var usuarioRepo = new Mock<IUsuarioRepository>();
        var uow = new Mock<IUnitOfWork>();
        var validation = new Mock<IDocumentValidationService>();
        var validacionRepo = new Mock<IValidacionRepository>();
        var auditoriaRepo = new Mock<IAuditoriaRepository>();
        var ocr = new Mock<IOcrProvider>();
        var stateEngine = new Mock<IDocumentStateEngine>();
        var geo = new Mock<IGeoResolutionService>();
        var notifFactory = new Mock<INotificationFactory>();
        var notifRepo = new Mock<INotificacionRepository>();

        proyectoRepo.Setup(r => r.GetByIdAsync(projectId, It.IsAny<CancellationToken>())).ReturnsAsync(project);
        usuarioRepo.Setup(r => r.GetByIdWithPlanAsync(userId, It.IsAny<CancellationToken>())).ReturnsAsync(usuario);
        documentoRepo.Setup(r => r.GetTotalStorageBytesByUsuarioAsync(userId, It.IsAny<CancellationToken>())).ReturnsAsync(0L);
        validation.Setup(s => s.ValidateDocumentAsync(It.IsAny<Stream>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new DocumentValidationResult { IsValid = true, ValidatedFieldsJson = "{}" });
        documentoRepo.Setup(r => r.GetByProyectoIdAsync(projectId, It.IsAny<CancellationToken>())).ReturnsAsync(new List<Documento>());
        ocr.Setup(p => p.ProcessDocumentAsync(It.IsAny<Stream>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new OcrResult { Success = true, RawJson = "{}" });
        uow.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);
        notifFactory.Setup(n => n.CreateAsync(It.IsAny<Guid>(), It.IsAny<int>(), It.IsAny<string>(), It.IsAny<string?>(), It.IsAny<Guid?>(), It.IsAny<string?>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Notificacion(userId, "Documento subido"));

        var service = new DocumentService(
            documentoRepo.Object,
            proyectoRepo.Object,
            usuarioRepo.Object,
            blobStorage,
            uow.Object,
            validation.Object,
            validacionRepo.Object,
            auditoriaRepo.Object,
            ocr.Object,
            stateEngine.Object,
            geo.Object,
            notifFactory.Object,
            notifRepo.Object);

        using var stream = new MemoryStream(plaintext);

        // Act
        await service.UploadDocumentAsync(projectId, dto, stream, "test.pdf", "application/pdf", plaintext.Length);

        // Assert — el blob persistido NO puede ser el texto plano (RNF-3: cifrado en reposo)
        Assert.NotEmpty(inner.UploadedBytes);
        Assert.False(plaintext.SequenceEqual(inner.UploadedBytes),
            "El documento NO debe guardarse como texto plano: el decorador AES-256 debe cifrar antes de persistir.");
    }
}
