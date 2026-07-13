namespace Application.DTOs;

using System;
using Domain.Enums;

public record ProyectoDto(
    Guid Id,
    string CodigoInterno,
    string Nombre,
    string UbicacionTexto,
    string? UbicacionGps,
    string? ImagenUrl,
    decimal? ValorEstimado,
    ProjectCategory Categoria,
    string? DatosDesarrollador,
    string? RncDesarrollador,
    string? DesignacionCatastral,
    string? Matricula,
    string? Propietario,
    string? CedulaRncPropietario,
    string? Ipi,
    EstadoJuridico EstadoJuridico,
    string? EstatusIpi,
    decimal? SuperficieM2,
    string EstatusDescripcion,
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
    string? RncDesarrollador = null,
    string? DesignacionCatastral = null,
    string? UbicacionGps = null,
    string? Matricula = null,
    string? Propietario = null,
    string? CedulaRncPropietario = null,
    string? Ipi = null,
    string? EstatusIpi = null,
    decimal? SuperficieM2 = null
);
