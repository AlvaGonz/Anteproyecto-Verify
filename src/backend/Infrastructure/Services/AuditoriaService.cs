namespace Infrastructure.Services;

using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions;
using Application.Abstractions.Persistence;
using Domain.Entities;

public class AuditoriaService : IAuditLogger
{
    private readonly IAuditoriaRepository _auditoriaRepository;
    private readonly IUsuarioRepository _usuarioRepository;
    private readonly IUnitOfWork _unitOfWork;

    public AuditoriaService(
        IAuditoriaRepository auditoriaRepository,
        IUsuarioRepository usuarioRepository,
        IUnitOfWork unitOfWork)
    {
        _auditoriaRepository = auditoriaRepository;
        _usuarioRepository = usuarioRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task Append(AuditEntryDto entry, CancellationToken cancellationToken = default)
    {
        System.Guid? usuarioId = entry.UsuarioId;
        if (usuarioId.HasValue && usuarioId.Value != System.Guid.Empty)
        {
            var user = await _usuarioRepository.GetByIdAsync(usuarioId.Value, cancellationToken);
            if (user == null)
            {
                usuarioId = null;
            }
        }
        else
        {
            usuarioId = null;
        }

        var auditoria = new Auditoria(
            usuarioId,
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
