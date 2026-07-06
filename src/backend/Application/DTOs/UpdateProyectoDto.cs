namespace Application.DTOs;

using System;
using Domain.Enums;

public record UpdateProyectoDto(
    string Nombre,
    string UbicacionTexto,
    string? UbicacionGps,
    decimal? ValorEstimado,
    ProjectCategory Categoria,
    string? DatosDesarrollador,
    string? RncDesarrollador,
    string? DesignacionCatastral,
    string? Matricula,
    string? Propietario,
    string? CedulaRncPropietario,
    string? Ipi
);
