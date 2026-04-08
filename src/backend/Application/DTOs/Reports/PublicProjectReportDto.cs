namespace Application.DTOs.Reports;

using System;

public record PublicProjectReportDto(
    Guid Id,
    Guid ProyectoId,
    string EstadoReporte,
    string ResumenPublico,
    string EstadoProyectoVisible,
    string EstadoExpedienteVisible,
    DateTime FechaGeneracionUtc,
    DateTime UltimaActualizacionUtc,
    int Version,
    bool EsPublico
);
