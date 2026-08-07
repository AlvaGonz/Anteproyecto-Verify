namespace Infrastructure.Storage;

using Application.Abstractions.Storage;
using System;
using System.IO;
using System.Security.Cryptography;
using System.Threading;
using System.Threading.Tasks;

/// <summary>
/// RNF-3: cifrado en reposo AES-256. Envuelve cualquier IBlobStorageService y
/// cifra todo stream antes de persistir (IV aleatorio de 16 bytes prepended al
/// ciphertext) y lo descifra de forma transparente al descargar.
/// </summary>
public sealed class AesEncryptingBlobStorageDecorator : IBlobStorageService
{
    private const int IvSize = 16; // AES block size

    private readonly IBlobStorageService _inner;
    private readonly byte[] _key; // 32 bytes = AES-256

    public AesEncryptingBlobStorageDecorator(IBlobStorageService inner, byte[] key)
    {
        _inner = inner ?? throw new ArgumentNullException(nameof(inner));
        _key = key ?? throw new ArgumentNullException(nameof(key));
        if (_key.Length != 32)
        {
            throw new ArgumentException("La clave AES-256 debe tener exactamente 32 bytes.", nameof(key));
        }
    }

    public async Task<UploadResult> UploadAsync(Stream stream, string fileName, string contentType, CancellationToken cancellationToken = default)
    {
        using var encryptedStream = new MemoryStream();
        using (var aes = Aes.Create())
        {
            aes.Key = _key;
            aes.GenerateIV();
            encryptedStream.Write(aes.IV, 0, IvSize);

            using var cryptoStream = new CryptoStream(encryptedStream, aes.CreateEncryptor(), CryptoStreamMode.Write, leaveOpen: true);
            await stream.CopyToAsync(cryptoStream, cancellationToken);
            await cryptoStream.FlushFinalBlockAsync(cancellationToken);
        }

        encryptedStream.Position = 0;
        return await _inner.UploadAsync(encryptedStream, fileName, contentType, cancellationToken);
    }

    public async Task<(Stream Stream, string ContentType)> DownloadAsync(string blobName, CancellationToken cancellationToken = default)
    {
        var (cipherStream, contentType) = await _inner.DownloadAsync(blobName, cancellationToken);
        using var buffer = new MemoryStream();
        await cipherStream.CopyToAsync(buffer, cancellationToken);
        buffer.Position = 0;

        if (buffer.Length < IvSize)
        {
            throw new InvalidDataException("Blob cifrado corrupto: falta el IV.");
        }

        var iv = new byte[IvSize];
        _ = buffer.Read(iv, 0, IvSize);

        using var aes = Aes.Create();
        aes.Key = _key;
        aes.IV = iv;

        var plainStream = new MemoryStream();
        using (var cryptoStream = new CryptoStream(buffer, aes.CreateDecryptor(), CryptoStreamMode.Read, leaveOpen: true))
        {
            await cryptoStream.CopyToAsync(plainStream, cancellationToken);
        }

        plainStream.Position = 0;
        return (plainStream, contentType);
    }

    public Task<bool> ExistsAsync(string blobName, CancellationToken cancellationToken = default)
        => _inner.ExistsAsync(blobName, cancellationToken);

    public Task DeleteAsync(string fileUrl, CancellationToken cancellationToken = default)
        => _inner.DeleteAsync(fileUrl, cancellationToken);
}
