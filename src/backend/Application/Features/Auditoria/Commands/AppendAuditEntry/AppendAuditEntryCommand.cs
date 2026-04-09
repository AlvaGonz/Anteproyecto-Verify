namespace Application.Features.Auditoria.Commands.AppendAuditEntry;

using System;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions;
using Domain.Enums;

public class AppendAuditEntryCommand
{
    public Guid? UsuarioId { get; set; }
    public TipoOperacion TipoOperacion { get; set; }
    public string Accion { get; set; } = string.Empty;
    public string Resultado { get; set; } = string.Empty;
    public Guid? ReferenciaExpedienteId { get; set; }
    public string? IpOrigen { get; set; }
    public string? UserAgent { get; set; }
}

public class AppendAuditEntryCommandHandler
{
    private readonly IAuditLogger _auditLogger;

    public AppendAuditEntryCommandHandler(IAuditLogger auditLogger)
    {
        _auditLogger = auditLogger;
    }

    public async Task<bool> Handle(AppendAuditEntryCommand request, CancellationToken cancellationToken)
    {
        var entry = new AuditEntryDto
        {
            UsuarioId = request.UsuarioId,
            TipoOperacion = request.TipoOperacion,
            Accion = request.Accion,
            Resultado = request.Resultado,
            ReferenciaExpedienteId = request.ReferenciaExpedienteId,
            IpOrigen = request.IpOrigen,
            UserAgent = request.UserAgent
        };

        await _auditLogger.AppendAsync(entry, cancellationToken);
        return true;
    }
}
