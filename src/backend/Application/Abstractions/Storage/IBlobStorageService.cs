namespace Application.Abstractions.Storage;

using System.IO;
using System.Threading;
using System.Threading.Tasks;

public interface IBlobStorageService
{
    Task<UploadResult> UploadAsync(Stream stream, string fileName, string contentType, CancellationToken cancellationToken = default);
    Task<(Stream Stream, string ContentType)> DownloadAsync(string blobName, CancellationToken cancellationToken = default);
    Task<bool> ExistsAsync(string blobName, CancellationToken cancellationToken = default);
    Task DeleteAsync(string fileUrl, CancellationToken cancellationToken = default);
}
