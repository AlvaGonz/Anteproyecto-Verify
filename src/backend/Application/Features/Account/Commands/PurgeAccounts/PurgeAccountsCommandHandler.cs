namespace Application.Features.Account.Commands.PurgeAccounts;

using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions;
using Application.Abstractions.Persistence;
using Domain.Enums;

public class PurgeAccountsCommandHandler
{
    private readonly IUsuarioRepository _usuarioRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IAuditLogger _auditLogger;

    public PurgeAccountsCommandHandler(
        IUsuarioRepository usuarioRepository,
        IUnitOfWork unitOfWork,
        IAuditLogger auditLogger)
    {
        _usuarioRepository = usuarioRepository;
        _unitOfWork = unitOfWork;
        _auditLogger = auditLogger;
    }

    public async Task<PurgeAccountsResult> Handle(PurgeAccountsCommand request, CancellationToken cancellationToken)
    {
        var eligible = await _usuarioRepository.GetPendingPurgeAsync(cancellationToken);
        if (!eligible.Any())
            return new PurgeAccountsResult(true, 0, null);

        foreach (var user in eligible)
        {
            user.AnonymizePii();

            await _auditLogger.AppendAsync(new AuditEntryDto
            {
                UsuarioId = user.Id,
                TipoOperacion = TipoOperacion.CuentaPurgada,
                Accion = "Purga automática de cuenta",
                Resultado = "Anonimizado"
            }, cancellationToken);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new PurgeAccountsResult(true, eligible.Count, null);
    }
}
