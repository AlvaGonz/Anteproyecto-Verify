namespace Application.DTOs.Reports;

using System;

public record ProjectReportDto(
    Guid Id,
    Guid ProyectoId,
    string EstadoReporte,
    string? Resumen,
    int Version,
    Guid? GeneradoPorUsuarioId,
    DateTime CreatedAtUtc,
    DateTime? UpdatedAtUtc
);
