namespace Application.Features.Audit.Queries.ExportAuditTrail;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Persistence;

public class ExportAuditTrailQueryHandler
{
    private readonly IAuditoriaRepository _auditoriaRepository;

    public ExportAuditTrailQueryHandler(IAuditoriaRepository auditoriaRepository)
    {
        _auditoriaRepository = auditoriaRepository;
    }

    public async Task<byte[]> HandleAsync(Guid projectId, CancellationToken cancellationToken = default)
    {
        var auditLogs = await _auditoriaRepository.GetByProyectoIdAsync(projectId, cancellationToken);
        var orderedLogs = auditLogs.OrderByDescending(a => a.FechaEventoUtc).ToList();

        var csvBuilder = new StringBuilder();
        csvBuilder.AppendLine("Id,FechaEventoUtc,TipoEvento,Accion,Entidad,EntidadId,UsuarioId,Detalle");

        foreach (var log in orderedLogs)
        {
            var detalle = log.Detalle?.Replace("\"", "\"\"") ?? "";
            csvBuilder.AppendLine($"{log.Id},{log.FechaEventoUtc:O},{log.TipoEvento},{log.Accion},{log.Entidad},{log.EntidadId},{log.UsuarioId},\"{detalle}\"");
        }

        return Encoding.UTF8.GetBytes(csvBuilder.ToString());
    }
}
