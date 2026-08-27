namespace Application.Features.Audit.Queries.ExportGlobalAuditTrail;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Persistence;
using Application.Abstractions.Reports;

public class ExportGlobalAuditTrailQueryHandler
{
    private readonly IAuditoriaRepository _auditoriaRepository;
    private readonly IReportGenerator _reportGenerator;
    private readonly IUsuarioRepository _usuarioRepository;

    public ExportGlobalAuditTrailQueryHandler(
        IAuditoriaRepository auditoriaRepository,
        IReportGenerator reportGenerator,
        IUsuarioRepository usuarioRepository)
    {
        _auditoriaRepository = auditoriaRepository;
        _reportGenerator = reportGenerator;
        _usuarioRepository = usuarioRepository;
    }

    public async Task<byte[]> HandleAsync(CancellationToken cancellationToken = default)
    {
        var auditLogs = await _auditoriaRepository.GetFilteredAsync(null, null, null, cancellationToken);
        var orderedLogs = auditLogs.OrderByDescending(a => a.FechaEventoUtc).ToList();

        var csvBuilder = new StringBuilder();
        csvBuilder.AppendLine("Id,ProyectoId,FechaEventoUtc,TipoEvento,Accion,Entidad,EntidadId,UsuarioId,Detalle");

        foreach (var log in orderedLogs)
        {
            string resolvedDetalle = "Éxito";
            var val = (log.Resultado ?? log.Detalle ?? "").ToLower();
            if (val.Contains("fallo") || val.Contains("falló") || val.Contains("fallido") || val.Contains("error") || val.Contains("fail") || val.Contains("throttled") || val.Contains("incorrecto"))
            {
                resolvedDetalle = "Fallido";
            }
            csvBuilder.AppendLine($"{log.Id},{log.ProyectoId},{log.FechaEventoUtc:O},{log.TipoEvento},{log.Accion},{log.Entidad},{log.EntidadId},{log.UsuarioId},\"{resolvedDetalle}\"");
        }

        return Encoding.UTF8.GetBytes(csvBuilder.ToString());
    }

    public async Task<byte[]> HandlePdfAsync(Guid? currentUserId, CancellationToken cancellationToken = default)
    {
        string userNombreCompleto = "Usuario del Sistema";
        if (currentUserId.HasValue)
        {
            var user = await _usuarioRepository.GetByIdAsync(currentUserId.Value, cancellationToken);
            if (user != null)
            {
                userNombreCompleto = $"{user.Nombre} {user.Apellido}";
            }
        }

        var auditLogs = await _auditoriaRepository.GetFilteredAsync(null, null, null, cancellationToken);
        var orderedLogs = auditLogs.OrderByDescending(a => a.FechaEventoUtc).ToList();

        var mappedLogs = orderedLogs.Select(a => {
            string? codigo = "N/A";
            if (a.Proyecto != null)
            {
                codigo = a.Proyecto.CodigoInterno;
            }
            else if (a.Entidad == "Proyecto" && !string.IsNullOrEmpty(a.EntidadId))
            {
                codigo = a.EntidadId.Length > 8 ? a.EntidadId.Substring(0, 8) : a.EntidadId;
            }
            else if (a.Entidad == "Usuario" || a.Usuario != null)
            {
                var usr = a.Usuario;
                codigo = usr != null ? (usr.Nickname ?? usr.CorreoElectronico) : (a.EntidadId?.Length > 8 ? a.EntidadId.Substring(0, 8) : a.EntidadId);
            }
            else if (!string.IsNullOrEmpty(a.EntidadId))
            {
                codigo = a.EntidadId.Length > 8 ? a.EntidadId.Substring(0, 8) : a.EntidadId;
            }

            string resolvedDetalle = "Éxito";
            var val = (a.Resultado ?? a.Detalle ?? "").ToLower();
            if (val.Contains("fallo") || val.Contains("falló") || val.Contains("fallido") || val.Contains("error") || val.Contains("fail") || val.Contains("throttled") || val.Contains("incorrecto"))
            {
                resolvedDetalle = "Fallido";
            }

            return new Application.DTOs.Audit.AuditDto(
                a.Id,
                a.ProyectoId,
                a.UsuarioId,
                a.TipoEvento,
                a.Accion,
                a.Entidad,
                a.EntidadId,
                resolvedDetalle,
                a.IpOrigen,
                a.UserAgent,
                a.FechaEventoUtc,
                codigo
            );
        }).ToList();

        return await _reportGenerator.GenerateAuditLogPdfAsync(userNombreCompleto, mappedLogs, cancellationToken);
    }
}
