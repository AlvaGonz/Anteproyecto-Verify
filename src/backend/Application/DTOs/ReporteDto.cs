namespace Application.DTOs;

using System;
using Domain.Enums;

public record ReporteDto(
    Guid Id,
    Guid ProyectoId,
    ReportStatus EstadoReporte,
    string? Resumen,
    Guid? GeneradoPorUsuarioId,
    int Version,
    DateTime CreatedAtUtc
);

public record CreateReporteDto(
    Guid ProyectoId,
    Guid? GeneradoPorUsuarioId
);
