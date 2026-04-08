namespace Application.DTOs;

using System;
using Domain.Enums;

public record DocumentoDto(
    Guid Id,
    Guid ProyectoId,
    DocumentType TipoDocumento,
    string NombreArchivoOriginal,
    string RutaArchivo,
    DateTime? FechaEmision,
    DocumentStatus EstadoDocumento,
    string? InstitucionEmisora,
    bool? FirmaValida,
    string? Observaciones,
    DateTime CreatedAtUtc
);

public record CreateDocumentoDto(
    Guid ProyectoId,
    DocumentType TipoDocumento,
    string NombreArchivoOriginal,
    string RutaArchivo
);
