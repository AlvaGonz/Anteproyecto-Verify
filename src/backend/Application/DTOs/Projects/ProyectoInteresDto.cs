namespace Application.DTOs.Projects;

using System;

public record ProyectoInteresDto(
    string Tipo,
    Guid ProyectoId,
    string NombreProyecto,
    Guid UsuarioId,
    string NombreUsuario,
    string? AvatarUrl,
    DateTime Fecha,
    string Rnc,
    string Direccion,
    string Telefono,
    string Email,
    string Provincia
);
