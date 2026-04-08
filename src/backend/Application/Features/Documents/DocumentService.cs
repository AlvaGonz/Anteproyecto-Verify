namespace Application.Features.Documents;

using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Persistence;
using Application.Abstractions.Storage;
using Application.Contracts.Documents;
using Application.DTOs.Documents;
using Application.Common.Security;
using Domain.Entities;
using Domain.Enums;

public class DocumentService : IDocumentService
{
    private readonly IDocumentoRepository _documentoRepository;
    private readonly IProyectoRepository _proyectoRepository;
    private readonly IBlobStorageService _blobStorageService;
    private readonly IUnitOfWork _unitOfWork;

    public DocumentService(
        IDocumentoRepository documentoRepository,
        IProyectoRepository proyectoRepository,
        IBlobStorageService blobStorageService,
        IUnitOfWork unitOfWork)
    {
        _documentoRepository = documentoRepository;
        _proyectoRepository = proyectoRepository;
        _blobStorageService = blobStorageService;
        _unitOfWork = unitOfWork;
    }

    public async Task<DocumentDto> UploadDocumentAsync(Guid projectId, UploadDocumentDto dto, Stream fileStream, string fileName, string contentType, long length, CancellationToken cancellationToken = default)
    {
        var project = await _proyectoRepository.GetByIdAsync(projectId, cancellationToken);
        if (project == null)
            throw new KeyNotFoundException($"Proyecto con ID {projectId} no encontrado.");

        if (!FileSignatureValidator.IsValidFileSignature(fileName, fileStream))
        {
            throw new ArgumentException("El archivo proporcionado no tiene una firma válida o su formato no es soportado.");
        }

        var extension = Path.GetExtension(fileName);
        var blobName = $"{projectId}/{Guid.NewGuid()}{extension}";
        
        var blobUrl = await _blobStorageService.UploadAsync(fileStream, blobName, contentType, cancellationToken);

        // Calculate version (simple approach: count existing documents of same type)
        var existingDocs = await _documentoRepository.GetByProyectoIdAsync(projectId, cancellationToken);
        var version = existingDocs.Count(d => d.TipoDocumento == dto.TipoDocumento) + 1;

        var document = new Documento(
            projectId,
            dto.TipoDocumento,
            fileName,
            blobName,
            blobUrl,
            contentType,
            extension,
            length,
            dto.UsuarioCargaId,
            version,
            dto.FechaEmision,
            dto.InstitucionEmisora,
            dto.Observaciones
        );

        await _documentoRepository.AddAsync(document, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToDto(document);
    }

    public async Task<IEnumerable<DocumentDto>> GetProjectDocumentsAsync(Guid projectId, CancellationToken cancellationToken = default)
    {
        var documents = await _documentoRepository.GetByProyectoIdAsync(projectId, cancellationToken);
        return documents.Select(MapToDto);
    }

    public async Task<(Stream Stream, string ContentType, string FileName)> DownloadDocumentAsync(Guid documentId, CancellationToken cancellationToken = default)
    {
        var document = await _documentoRepository.GetByIdAsync(documentId, cancellationToken);
        if (document == null)
            throw new KeyNotFoundException($"Documento con ID {documentId} no encontrado.");

        var (stream, contentType) = await _blobStorageService.DownloadAsync(document.NombreArchivoAlmacenado, cancellationToken);
        return (stream, document.ContentType, document.NombreArchivoOriginal);
    }

    public async Task<DocumentDto> UpdateDocumentStatusAsync(Guid documentId, UpdateDocumentStatusDto dto, CancellationToken cancellationToken = default)
    {
        var document = await _documentoRepository.GetByIdAsync(documentId, cancellationToken);
        if (document == null)
            throw new KeyNotFoundException($"Documento con ID {documentId} no encontrado.");

        if (dto.EstadoDocumento.HasValue)
        {
            document.UpdateStatus(dto.EstadoDocumento.Value, dto.Observaciones);
        }

        if (dto.Activo.HasValue)
        {
            document.ToggleActive(dto.Activo.Value);
        }

        _documentoRepository.Update(document);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToDto(document);
    }

    private static DocumentDto MapToDto(Documento d) => new(
        d.Id,
        d.ProyectoId,
        d.TipoDocumento,
        d.NombreArchivoOriginal,
        d.ContentType,
        d.Extension,
        d.TamanoBytes,
        d.EstadoDocumento,
        d.Activo,
        d.Version,
        d.FechaEmision,
        d.InstitucionEmisora,
        d.UsuarioCargaId,
        d.Observaciones,
        d.CreatedAtUtc,
        d.UpdatedAtUtc
    );
}
