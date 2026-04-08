namespace Application.DTOs.Documents;

using Domain.Enums;

public record DocumentDiagnosticDto(
    DocumentType TipoDocumento,
    string Nombre,
    string Estado // "Presente", "Ausente", "Incompleto"
);
