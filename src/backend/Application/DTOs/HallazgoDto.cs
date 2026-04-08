namespace Application.DTOs;

using System;
using Domain.Enums;

public record HallazgoDto(
    Guid Id,
    Guid ProyectoId,
    Guid? ValidacionId,
    FindingSeverity Severidad,
    string Codigo,
    string Titulo,
    string Descripcion,
    string? Recomendacion,
    bool Resuelto,
    DateTime CreatedAtUtc
);

public record CreateHallazgoDto(
    Guid ProyectoId,
    FindingSeverity Severidad,
    string Codigo,
    string Titulo,
    string Descripcion,
    Guid? ValidacionId
);
