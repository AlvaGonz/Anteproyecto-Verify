namespace Application.Features.Audit.Queries.ExportGlobalAuditTrail;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Persistence;

public class ExportGlobalAuditTrailQueryHandler
{
    private readonly IAuditoriaRepository _auditoriaRepository;

    public ExportGlobalAuditTrailQueryHandler(IAuditoriaRepository auditoriaRepository)
    {
        _auditoriaRepository = auditoriaRepository;
    }

    public async Task<byte[]> HandleAsync(CancellationToken cancellationToken = default)
    {
        var auditLogs = await _auditoriaRepository.GetFilteredAsync(null, null, null, cancellationToken);
        var orderedLogs = auditLogs.OrderByDescending(a => a.FechaEventoUtc).ToList();

        var csvBuilder = new StringBuilder();
        csvBuilder.AppendLine("Id,ProyectoId,FechaEventoUtc,TipoEvento,Accion,Entidad,EntidadId,UsuarioId,Detalle");

        foreach (var log in orderedLogs)
        {
            var detalle = log.Detalle?.Replace("\"", "\"\"") ?? "";
            csvBuilder.AppendLine($"{log.Id},{log.ProyectoId},{log.FechaEventoUtc:O},{log.TipoEvento},{log.Accion},{log.Entidad},{log.EntidadId},{log.UsuarioId},\"{detalle}\"");
        }

        return Encoding.UTF8.GetBytes(csvBuilder.ToString());
    }
}
