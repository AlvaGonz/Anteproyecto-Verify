namespace Application.DTOs.Documents;

using System;
using Domain.Enums;
using Application.Documents.Extractions;

public record ValidationDocumentDto(
    Guid Id,
    Guid ProyectoId,
    DocumentType TipoDocumento,
    string NombreArchivoOriginal,
    string ContentType,
    string Extension,
    long TamanoBytes,
    DocumentStatus EstadoDocumento,
    bool Activo,
    int Version,
    DateTime? FechaEmision,
    string? InstitucionEmisora,
    Guid UsuarioCargaId,
    string? Observaciones,
    DateTime CreatedAtUtc,
    DateTime? UpdatedAtUtc,
    CedulaRdExtractionV1? CedulaExtraction = null,
    CertificadoTituloRdExtractionV1? CertificadoTituloExtraction = null
);
