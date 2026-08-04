namespace Application.DTOs;

using System;
using Domain.Enums;

public record UpdateProyectoDto(
    string Nombre,
    string UbicacionTexto,
    string? UbicacionGps,
    decimal? ValorEstimado,
    int CategoriaId,
    string? DatosDesarrollador,
    string? RncDesarrollador,
    string? DesignacionCatastral,
    string? Matricula,
    string? Propietario,
    string? CedulaRncPropietario,
    string? Ipi,
    string? EstatusIpi,
    decimal? SuperficieM2,
    string? ImagenUrl = null,
    string? ImagenAdicional1 = null,
    string? ImagenAdicional2 = null,
    string? ImagenAdicional3 = null,
    string? ImagenAdicional4 = null,
    string? ImagenAdicional5 = null,
    Guid? ProvinciaId = null
);
