namespace Application.DTOs;

using System;
using Domain.Enums;

public record ProyectoDto(
    Guid Id,
    string CodigoInterno,
    string Nombre,
    string UbicacionTexto,
    string? UbicacionGps,
    decimal? ValorEstimado,
    ProjectCategory Categoria,
    string? DatosDesarrollador,
    string? DesignacionCatastral,
    ProjectStatus EstadoProyecto,
    IntegrityStatus EstadoIntegridad,
    Guid UsuarioCreadorId,
    DateTime CreatedAtUtc,
    DateTime? UpdatedAtUtc
);

public record CreateProyectoDto(
    string Nombre,
    string UbicacionTexto,
    Guid UsuarioCreadorId,
    ProjectCategory Categoria = ProjectCategory.Residencial,
    string? DatosDesarrollador = null,
    string? DesignacionCatastral = null,
    string? UbicacionGps = null
);
