namespace Application.DTOs.Documents;

using System;
using Domain.Enums;

public record UploadDocumentDto(
    DocumentType TipoDocumento,
    Guid UsuarioCargaId,
    DateTime? FechaEmision,
    string? InstitucionEmisora,
    string? Observaciones
);
