namespace Application.Contracts.Documents;

using System;
using System.Collections.Generic;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using Application.DTOs.Documents;
using Domain.Enums;

public interface IDocumentService
{
    Task<DocumentDto> UploadDocumentAsync(Guid projectId, UploadDocumentDto dto, Stream fileStream, string fileName, string contentType, long length, CancellationToken cancellationToken = default);
    Task<IEnumerable<DocumentDto>> GetProjectDocumentsAsync(Guid projectId, CancellationToken cancellationToken = default);
    Task<(Stream Stream, string ContentType, string FileName)> DownloadDocumentAsync(Guid documentId, CancellationToken cancellationToken = default);
    Task<DocumentDto> UpdateDocumentStatusAsync(Guid documentId, UpdateDocumentStatusDto dto, CancellationToken cancellationToken = default);
}
