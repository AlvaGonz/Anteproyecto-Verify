namespace Application.DTOs.Documents;

using Domain.Enums;

public record RequiredDocumentDto(
    DocumentType TipoDocumento,
    string Nombre,
    string Descripcion,
    ProjectCategory Categoria
);
