namespace Application.DTOs.Documents;

using Domain.Enums;

public record UpdateDocumentStatusDto(
    DocumentStatus? EstadoDocumento,
    bool? Activo,
    string? Observaciones
);
