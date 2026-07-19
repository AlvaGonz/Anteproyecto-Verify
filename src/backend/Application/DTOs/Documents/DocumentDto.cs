namespace Application.DTOs.Documents;

using System;
using Domain.Enums;

public record DocumentDto(
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
    string FileUrl,
    DateTime CreatedAtUtc,
    DateTime? UpdatedAtUtc,
    string? ResultadoOcrJson = null
);
