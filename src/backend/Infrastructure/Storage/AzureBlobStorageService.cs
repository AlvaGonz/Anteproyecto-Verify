namespace Infrastructure.Storage;

using Application.Abstractions.Storage;
using Configuration;
using Microsoft.Extensions.Options;
using System.IO;
using System.Threading;
using System.Threading.Tasks;

public class AzureBlobStorageService : IBlobStorageService
{
    private readonly AzureBlobOptions _options;

    public AzureBlobStorageService(IOptions<AzureBlobOptions> options)
    {
        _options = options.Value;
    }

    public async Task<string> UploadAsync(Stream stream, string fileName, string contentType, CancellationToken cancellationToken = default)
    {
        var wwwrootPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
        if (!Directory.Exists(wwwrootPath))
        {
            Directory.CreateDirectory(wwwrootPath);
        }

        var safeFileName = fileName.Replace("\\", Path.DirectorySeparatorChar.ToString()).Replace("/", Path.DirectorySeparatorChar.ToString());
        var filePath = Path.Combine(wwwrootPath, safeFileName);
        
        var directoryPath = Path.GetDirectoryName(filePath);
        if (directoryPath != null && !Directory.Exists(directoryPath))
        {
            Directory.CreateDirectory(directoryPath);
        }

        using (var fileStream = new FileStream(filePath, FileMode.Create, FileAccess.Write))
        {
            await stream.CopyToAsync(fileStream, cancellationToken);
        }

        return $"http://localhost:5000/uploads/{string.Join("/", parts)}";
    }

    public Task<(Stream Stream, string ContentType)> DownloadAsync(string blobName, CancellationToken cancellationToken = default)
    {
        var safeFileName = blobName.Replace("\\", Path.DirectorySeparatorChar.ToString()).Replace("/", Path.DirectorySeparatorChar.ToString());
        var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", safeFileName);
        
        if (File.Exists(filePath))
        {
            var stream = new FileStream(filePath, FileMode.Open, FileAccess.Read, FileShare.Read);
            return Task.FromResult(((Stream)stream, "application/octet-stream"));
        }

        var memoryStream = new MemoryStream(System.Text.Encoding.UTF8.GetBytes("File not found"));
        return Task.FromResult(((Stream)memoryStream, "application/octet-stream"));
    }

    public Task<bool> ExistsAsync(string blobName, CancellationToken cancellationToken = default)
    {
        // Implementation for Azure Blob Storage
        return Task.FromResult(true);
    }

    public Task DeleteAsync(string fileUrl, CancellationToken cancellationToken = default)
    {
        // Implementation for Azure Blob Storage
        return Task.CompletedTask;
    }
}
