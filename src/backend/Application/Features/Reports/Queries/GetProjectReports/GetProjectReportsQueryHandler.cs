namespace Application.Features.Reports.Queries.GetProjectReports;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Persistence;
using Application.DTOs.Reports;

public class GetProjectReportsQueryHandler
{
    private readonly IReporteRepository _reporteRepository;

    public GetProjectReportsQueryHandler(IReporteRepository reporteRepository)
    {
        _reporteRepository = reporteRepository;
    }

    public async Task<IEnumerable<ProjectReportDto>> HandleAsync(Guid projectId, CancellationToken cancellationToken = default)
    {
        var reportes = await _reporteRepository.GetByProyectoIdAsync(projectId, cancellationToken);

        return reportes.OrderByDescending(r => r.CreatedAtUtc).Select(r => new ProjectReportDto(
            Id: r.Id,
            ProyectoId: r.ProyectoId,
            EstadoReporte: r.EstadoReporte.ToString(),
            Resumen: r.Resumen,
            Version: r.Version,
            GeneradoPorUsuarioId: r.GeneradoPorUsuarioId,
            CreatedAtUtc: r.CreatedAtUtc,
            UpdatedAtUtc: r.UpdatedAtUtc
        ));
    }
}
