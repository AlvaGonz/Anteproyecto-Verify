namespace Application.Features.Reports.Queries.GetPublicProjectReport;

using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Persistence;
using Application.DTOs.Reports;
using Domain.Enums;

public class GetPublicProjectReportQueryHandler
{
    private readonly IReporteRepository _reporteRepository;
    private readonly IProyectoRepository _proyectoRepository;

    public GetPublicProjectReportQueryHandler(IReporteRepository reporteRepository, IProyectoRepository proyectoRepository)
    {
        _reporteRepository = reporteRepository;
        _proyectoRepository = proyectoRepository;
    }

    public async Task<PublicProjectReportDto?> HandleAsync(Guid projectId, CancellationToken cancellationToken = default)
    {
        var proyecto = await _proyectoRepository.GetByIdAsync(projectId, cancellationToken);
        if (proyecto == null) return null;

        var reportes = await _reporteRepository.GetByProyectoIdAsync(projectId, cancellationToken);
        var ultimoReporte = reportes.OrderByDescending(r => r.CreatedAtUtc).FirstOrDefault(r => r.EstadoReporte == ReportStatus.Generated);

        if (ultimoReporte == null) return null;

        string projectStatusStr = proyecto.Status switch
        {
            ProjectStatus.Draft => "Borrador",
            ProjectStatus.InReview => "En Revisión",
            ProjectStatus.Approved => "Aprobado",
            ProjectStatus.Rejected => "Rechazado",
            _ => "Desconocido"
        };

        return new PublicProjectReportDto(
            Id: ultimoReporte.Id,
            ProyectoId: ultimoReporte.ProyectoId,
            EstadoReporte: ultimoReporte.EstadoReporte.ToString(),
            ResumenPublico: ultimoReporte.Resumen ?? "Sin resumen público disponible.",
            EstadoProyectoVisible: projectStatusStr,
            EstadoExpedienteVisible: "Validado", // Simplified for public view
            FechaGeneracionUtc: ultimoReporte.CreatedAtUtc,
            UltimaActualizacionUtc: ultimoReporte.UpdatedAtUtc ?? ultimoReporte.CreatedAtUtc,
            Version: ultimoReporte.Version,
            EsPublico: true
        );
    }
}
