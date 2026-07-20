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
    string? ImagenAdicional1,
    string? ImagenAdicional2,
    string? ImagenAdicional3,
    string? ImagenAdicional4,
    string? ImagenAdicional5,
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
    string EstadoProyecto,
    IntegrityStatus EstadoIntegridad,
    Guid UsuarioCreadorId,
    DateTime CreatedAtUtc,
    DateTime? UpdatedAtUtc,
    ProjectRegistrantDto? RegistradoPor = null,
    string? PlanNombre = null
);

public record ProjectRegistrantDto(
    Guid Id,
    string NombreCompleto,
    string? RazonSocial,
    string Rol,
    string Email,
    string? Telefono,
    string? AvatarUrl,
    DateTime FechaRegistro,
    bool Verificado,
    Guid? TitularId = null
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
    decimal? SuperficieM2 = null,
    string? ImagenUrl = null,
    string? ImagenAdicional1 = null,
    string? ImagenAdicional2 = null,
    string? ImagenAdicional3 = null,
    string? ImagenAdicional4 = null,
    string? ImagenAdicional5 = null
);
