namespace Application.DTOs.Projects;

public record ProyectoEstadoCatalogoDto(
    Guid EstadoId,
    string CodigoUnico,
    string Nombre,
    string ColorHex,
    bool Activo);
