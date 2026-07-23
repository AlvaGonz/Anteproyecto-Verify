namespace Application.Features.Audit.Queries.GetGlobalAuditTrail;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Persistence;
using Application.DTOs.Audit;

public class GetGlobalAuditTrailQueryHandler
{
    private readonly IAuditoriaRepository _auditoriaRepository;

    public GetGlobalAuditTrailQueryHandler(IAuditoriaRepository auditoriaRepository)
    {
        _auditoriaRepository = auditoriaRepository;
    }

    public async Task<IEnumerable<AuditDto>> HandleAsync(string? tipoEvento = null, DateTime? fromDate = null, DateTime? toDate = null, CancellationToken cancellationToken = default)
    {
        var auditLogs = await _auditoriaRepository.GetFilteredAsync(tipoEvento, fromDate, toDate, cancellationToken);

        return auditLogs.Select(a => new AuditDto(
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
