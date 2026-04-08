namespace Application.DTOs;

using System;
using Domain.Enums;

public record UpdateProyectoDto(
    string Nombre,
    string UbicacionTexto,
    string? UbicacionGps,
    decimal? ValorEstimado
);
