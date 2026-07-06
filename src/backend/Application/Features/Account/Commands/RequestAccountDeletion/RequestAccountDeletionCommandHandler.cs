namespace Application.Features.Account.Commands.RequestAccountDeletion;

using System;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions;
using Application.Abstractions.Persistence;
using Domain.Enums;

public class RequestAccountDeletionCommandHandler
{
    private readonly IUsuarioRepository _usuarioRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IAuditLogger _auditLogger;
    private readonly IStripeService _stripeService;

    public RequestAccountDeletionCommandHandler(
        IUsuarioRepository usuarioRepository,
        IUnitOfWork unitOfWork,
        IAuditLogger auditLogger,
        IStripeService stripeService)
    {
        _usuarioRepository = usuarioRepository;
        _unitOfWork = unitOfWork;
        _auditLogger = auditLogger;
        _stripeService = stripeService;
    }

    public async Task<RequestAccountDeletionResult> Handle(RequestAccountDeletionCommand request, CancellationToken cancellationToken)
    {
        var user = await _usuarioRepository.GetByIdAsync(request.UserId, cancellationToken);
        if (user == null)
            return new RequestAccountDeletionResult(false, "Usuario no encontrado.");

        try
        {
            user.RequestDeletion(request.DeletionReason);
        }
        catch (InvalidOperationException ex)
        {
            return new RequestAccountDeletionResult(false, ex.Message);
        }

        // Cancel Stripe subscription at period end if active
        if (!string.IsNullOrEmpty(user.StripeSubscriptionId) &&
            user.SubscriptionStatus == "active")
        {
            await _stripeService.CancelAtPeriodEndAsync(user.StripeSubscriptionId, cancellationToken);
        }

        _usuarioRepository.Update(user);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await _auditLogger.AppendAsync(new AuditEntryDto
        {
            UsuarioId = user.Id,
            TipoOperacion = TipoOperacion.CuentaEliminada,
            Accion = "Solicitud de eliminación de cuenta",
            Resultado = "Éxito"
        }, cancellationToken);

        return new RequestAccountDeletionResult(true, null);
    }
}
