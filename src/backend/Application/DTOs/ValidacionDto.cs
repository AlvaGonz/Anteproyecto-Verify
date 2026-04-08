namespace Application.DTOs;

using System;
using Domain.Enums;

public record ValidacionDto(
    Guid Id,
    Guid ProyectoId,
    Guid? DocumentoId,
    string FuenteValidacion,
    ValidationStatus EstadoValidacion,
    bool? EsLegitimo,
    string? Detalle,
    DateTime CreatedAtUtc
);

public record CreateValidacionDto(
    Guid ProyectoId,
    string FuenteValidacion,
    Guid? DocumentoId
);
