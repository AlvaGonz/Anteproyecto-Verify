namespace Application.DTOs.Findings;

using System;
using Domain.Enums;

public record FindingDto(
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
