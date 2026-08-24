namespace Infrastructure.Storage;

using Application.Abstractions.Storage;
using Configuration;
using Microsoft.Extensions.Options;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using System;

public class AzureBlobStorageService : IBlobStorageService
{
    private readonly BlobContainerClient _containerClient;

    public AzureBlobStorageService(IOptions<AzureBlobOptions> options)
    {
        var connStr = string.IsNullOrWhiteSpace(options.Value.ConnectionString)
            ? "UseDevelopmentStorage=true"
            : options.Value.ConnectionString;
        var blobServiceClient = new BlobServiceClient(connStr);
        _containerClient = blobServiceClient.GetBlobContainerClient(string.IsNullOrWhiteSpace(options.Value.ContainerName) ? "verifinca-documents" : options.Value.ContainerName);
    }

    public async Task<UploadResult> UploadAsync(Stream stream, string fileName, string contentType, CancellationToken cancellationToken = default)
    {
        await _containerClient.CreateIfNotExistsAsync(PublicAccessType.None, cancellationToken: cancellationToken);
        
        var blobClient = _containerClient.GetBlobClient(fileName);
        var options = new BlobUploadOptions
        {
            HttpHeaders = new BlobHttpHeaders { ContentType = contentType }
        };

        await blobClient.UploadAsync(stream, options, cancellationToken);
        var uriString = blobClient.Uri.ToString();
        // Hack for local development in docker: replace azurite container name with localhost
        // so the browser can fetch the image directly.
        if (uriString.Contains("azurite:10000"))
        {
            uriString = uriString.Replace("azurite:10000", "localhost:10000");
        }
        
        return new UploadResult(fileName, uriString);
    }

    public async Task<(Stream Stream, string ContentType)> DownloadAsync(string blobName, CancellationToken cancellationToken = default)
    {
        var blobClient = _containerClient.GetBlobClient(blobName);
        var response = await blobClient.DownloadAsync(cancellationToken);
        return (response.Value.Content, response.Value.ContentType);
    }

    public async Task<bool> ExistsAsync(string blobName, CancellationToken cancellationToken = default)
    {
        var blobClient = _containerClient.GetBlobClient(blobName);
        var response = await blobClient.ExistsAsync(cancellationToken);
        return response.Value;
    }

    public async Task DeleteAsync(string fileUrl, CancellationToken cancellationToken = default)
    {
        try 
        {
            var uri = new Uri(fileUrl);
            var blobClient = new BlobClient(uri);
            await blobClient.DeleteIfExistsAsync(cancellationToken: cancellationToken);
        }
        catch (UriFormatException)
        {
            // Fallback for simple file names
            var blobClient = _containerClient.GetBlobClient(fileUrl);
            await blobClient.DeleteIfExistsAsync(cancellationToken: cancellationToken);
        }
    }
}
