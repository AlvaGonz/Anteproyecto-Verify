namespace Application.Features.Account.Commands.RecoverAccount;

using System;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions;
using Application.Abstractions.Persistence;
using Domain.Enums;

public class RecoverAccountCommandHandler
{
    private readonly IUsuarioRepository _usuarioRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IAuditLogger _auditLogger;

    public RecoverAccountCommandHandler(
        IUsuarioRepository usuarioRepository,
        IUnitOfWork unitOfWork,
        IAuditLogger auditLogger)
    {
        _usuarioRepository = usuarioRepository;
        _unitOfWork = unitOfWork;
        _auditLogger = auditLogger;
    }

    public async Task<RecoverAccountResult> Handle(RecoverAccountCommand request, CancellationToken cancellationToken)
    {
        var user = await _usuarioRepository.GetByIdAsync(request.UserId, cancellationToken);
        if (user == null)
            return new RecoverAccountResult(false, "Usuario no encontrado.");

        try
        {
            user.RecoverAccount();
        }
        catch (InvalidOperationException ex)
        {
            return new RecoverAccountResult(false, ex.Message);
        }

        _usuarioRepository.Update(user);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await _auditLogger.AppendAsync(new AuditEntryDto
        {
            UsuarioId = user.Id,
            TipoOperacion = TipoOperacion.CuentaRecuperada,
            Accion = "Recuperación de cuenta",
            Resultado = "Éxito"
        }, cancellationToken);

        return new RecoverAccountResult(true, null);
    }
}
