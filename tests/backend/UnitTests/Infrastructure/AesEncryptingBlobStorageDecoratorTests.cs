namespace UnitTests.Infrastructure;

using System;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using global::Application.Abstractions.Storage;
using global::Infrastructure.Storage;
using Moq;
using Xunit;

/// <summary>
/// RNF-3: Cifrado en reposo AES-256. El decorador debe cifrar todo stream
/// que se suba (IV aleatorio prepended) y descifrarlo de forma transparente
/// al bajarlo, de modo que el blob persistido jamás contenga texto plano.
/// </summary>
public class AesEncryptingBlobStorageDecoratorTests
{
    private static readonly byte[] Aes256Key = Enumerable.Range(0, 32).Select(i => (byte)i).ToArray();

    private static Mock<IBlobStorageService> CapturingInner(out Func<byte[]> getStored)
    {
        byte[] stored = Array.Empty<byte>();
        var inner = new Mock<IBlobStorageService>();
        inner.Setup(s => s.UploadAsync(It.IsAny<Stream>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .Callback<Stream, string, string, CancellationToken>((stream, _, _, _) =>
            {
                using var ms = new MemoryStream();
                stream.CopyTo(ms);
                stored = ms.ToArray();
            })
            .ReturnsAsync((Stream _, string name, string _, CancellationToken _) => new UploadResult(name, $"http://blob/{name}"));
        inner.Setup(s => s.DownloadAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(() => ((Stream)new MemoryStream(stored), "application/pdf"));
        getStored = () => stored;
        return inner;
    }

    [Fact]
    public async Task UploadAsync_Should_EncryptStream_SoStoredBytesDifferFromPlaintext()
    {
        // Arrange
        var plaintext = System.Text.Encoding.UTF8.GetBytes("%PDF-1.4 confidential title and cedula data");
        var inner = CapturingInner(out var getStored);
        var decorator = new AesEncryptingBlobStorageDecorator(inner.Object, Aes256Key);

        // Act
        await decorator.UploadAsync(new MemoryStream(plaintext), "doc.pdf", "application/pdf");

        // Assert — el blob persistido NO puede ser el texto plano (RNF-3)
        var stored = getStored();
        Assert.NotEmpty(stored);
        Assert.False(plaintext.SequenceEqual(stored), "El blob almacenado no debe contener el texto plano: falta el cifrado AES-256 en reposo.");
    }

    [Fact]
    public async Task UploadThenDownload_Should_RoundTripOriginalBytes_Transparently()
    {
        // Arrange
        var plaintext = System.Text.Encoding.UTF8.GetBytes("%PDF-1.4 confidential title and cedula data");
        var inner = CapturingInner(out _);
        var decorator = new AesEncryptingBlobStorageDecorator(inner.Object, Aes256Key);
        await decorator.UploadAsync(new MemoryStream(plaintext), "doc.pdf", "application/pdf");

        // Act — el descifrado debe ser transparente para el consumidor
        var (stream, contentType) = await decorator.DownloadAsync("doc.pdf");
        using var ms = new MemoryStream();
        await stream.CopyToAsync(ms);

        // Assert
        Assert.Equal("application/pdf", contentType);
        Assert.True(plaintext.SequenceEqual(ms.ToArray()), "El stream descifrado debe ser idéntico al original.");
    }

    [Fact]
    public async Task SamePlaintextUploadedTwice_Should_ProduceDifferentCiphertext()
    {
        // Arrange — IV aleatorio por archivo: dos uploads del mismo contenido no pueden generar el mismo ciphertext
        var plaintext = System.Text.Encoding.UTF8.GetBytes("%PDF-1.4 confidential title and cedula data");
        var firstInner = CapturingInner(out var firstStored);
        var secondInner = CapturingInner(out var secondStored);
        var decorator1 = new AesEncryptingBlobStorageDecorator(firstInner.Object, Aes256Key);
        var decorator2 = new AesEncryptingBlobStorageDecorator(secondInner.Object, Aes256Key);

        // Act
        await decorator1.UploadAsync(new MemoryStream(plaintext), "doc.pdf", "application/pdf");
        await decorator2.UploadAsync(new MemoryStream(plaintext), "doc.pdf", "application/pdf");

        // Assert
        Assert.False(firstStored().SequenceEqual(secondStored()), "Dos cifrados del mismo texto plano deben diferir (IV aleatorio por archivo).");
    }
}
