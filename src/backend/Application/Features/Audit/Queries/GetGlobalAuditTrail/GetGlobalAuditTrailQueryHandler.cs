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

        return auditLogs.Select(a => {
            string? codigo = "N/A";
            if (a.Proyecto != null)
            {
                codigo = a.Proyecto.CodigoInterno;
            }
            else if (a.ProyectoId != null)
            {
                codigo = a.ProyectoId.Value.ToString().Substring(0, 8);
            }
            else if (a.Entidad == "Proyecto" && !string.IsNullOrEmpty(a.EntidadId))
            {
                codigo = a.EntidadId.Length > 8 ? a.EntidadId.Substring(0, 8) : a.EntidadId;
            }
            else if (a.Entidad == "Usuario" || a.Usuario != null)
            {
                var usr = a.Usuario;
                codigo = usr != null ? (usr.Nickname ?? usr.CorreoElectronico ?? usr.Id.ToString().Substring(0, 8)) : (a.EntidadId?.Length > 8 ? a.EntidadId.Substring(0, 8) : a.EntidadId);
            }
            else if (a.UsuarioId != null)
            {
                codigo = a.UsuarioId.Value.ToString().Substring(0, 8);
            }
            else if (!string.IsNullOrEmpty(a.EntidadId))
            {
                codigo = a.EntidadId.Length > 8 ? a.EntidadId.Substring(0, 8) : a.EntidadId;
            }

            return new AuditDto(
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
                a.FechaEventoUtc,
                codigo
            );
        });
    }
}
