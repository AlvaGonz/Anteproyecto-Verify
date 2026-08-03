namespace Infrastructure.Services;

using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions;
using Application.Abstractions.Persistence;
using Domain.Entities;

public class AuditoriaService : IAuditLogger
{
    private readonly IAuditoriaRepository _auditoriaRepository;
    private readonly IUnitOfWork _unitOfWork;

    public AuditoriaService(IAuditoriaRepository auditoriaRepository, IUnitOfWork unitOfWork)
    {
        _auditoriaRepository = auditoriaRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task Append(AuditEntryDto entry, CancellationToken cancellationToken = default)
    {
        var auditoria = new Auditoria(
            entry.UsuarioId,
            entry.TipoOperacion,
            entry.Accion,
            entry.Resultado,
            entry.ReferenciaExpedienteId,
            entry.IpOrigen,
            entry.UserAgent,
            entry.EstadoAnteriorId,
            entry.EstadoNuevoId
        );

        await _auditoriaRepository.AddAsync(auditoria, cancellationToken);
    }

    public async Task AppendAsync(AuditEntryDto entry, CancellationToken cancellationToken = default)
    {
        await Append(entry, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
