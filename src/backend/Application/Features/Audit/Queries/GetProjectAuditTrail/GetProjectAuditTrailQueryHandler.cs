namespace Application.Features.Audit.Queries.GetProjectAuditTrail;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Persistence;
using Application.DTOs.Audit;

public class GetProjectAuditTrailQueryHandler
{
    private readonly IAuditoriaRepository _auditoriaRepository;

    public GetProjectAuditTrailQueryHandler(IAuditoriaRepository auditoriaRepository)
    {
        _auditoriaRepository = auditoriaRepository;
    }

    public async Task<IEnumerable<AuditDto>> HandleAsync(Guid projectId, string? tipoEvento = null, DateTime? fromDate = null, DateTime? toDate = null, CancellationToken cancellationToken = default)
    {
        var auditLogs = await _auditoriaRepository.GetByProyectoIdAsync(projectId, cancellationToken);

        var query = auditLogs.AsQueryable();

        if (!string.IsNullOrEmpty(tipoEvento))
        {
            query = query.Where(a => a.TipoEvento == tipoEvento);
        }

        if (fromDate.HasValue)
        {
            query = query.Where(a => a.FechaEventoUtc >= fromDate.Value);
        }

        if (toDate.HasValue)
        {
            query = query.Where(a => a.FechaEventoUtc <= toDate.Value);
        }

        return query.OrderByDescending(a => a.FechaEventoUtc).Select(a => new AuditDto(
            a.Id,
            a.ProyectoId,
            a.UsuarioId,
            a.TipoEvento,
            a.Accion,
            a.Entidad,
            a.EntidadId,
            a.Detalle,
            a.IpOrigen,
            a.UserAgent,
            a.FechaEventoUtc
        ));
    }
}
