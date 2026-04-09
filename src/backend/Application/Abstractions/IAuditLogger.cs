namespace Application.Abstractions;

using System;
using System.Threading;
using System.Threading.Tasks;
using Domain.Enums;

public class AuditEntryDto
{
    public Guid? UsuarioId { get; set; }
    public TipoOperacion TipoOperacion { get; set; }
    public string Accion { get; set; } = string.Empty;
    public string Resultado { get; set; } = string.Empty;
    public Guid? ReferenciaExpedienteId { get; set; }
    public string? IpOrigen { get; set; }
    public string? UserAgent { get; set; }
}

public interface IAuditLogger
{
    Task AppendAsync(AuditEntryDto entry, CancellationToken cancellationToken = default);
}
