namespace Application.Features.Auth.Commands.VerifyEmail;

using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Persistence;

public class VerifyEmailCommandHandler
{
    private readonly IUsuarioRepository _usuarioRepository;
    private readonly IUnitOfWork _unitOfWork;

    public VerifyEmailCommandHandler(
        IUsuarioRepository usuarioRepository,
        IUnitOfWork unitOfWork)
    {
        _usuarioRepository = usuarioRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<VerifyEmailResultDto> Handle(VerifyEmailCommand request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Token))
        {
            return new VerifyEmailResultDto(false, "El token de verificación es requerido.");
        }

        var user = await _usuarioRepository.GetByVerificationTokenAsync(request.Token, cancellationToken);
        
        if (user == null)
        {
            return new VerifyEmailResultDto(false, "El token de verificación es inválido o no existe.");
        }

        var isSuccess = user.VerificarEmail(request.Token);
        
        if (!isSuccess)
        {
            return new VerifyEmailResultDto(false, "El token de verificación es inválido o ha expirado.");
        }

        _usuarioRepository.Update(user);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Compute next step based on user's pending plan and subscription status
        // ponytail: centralize routing decision — frontend just navigates where told
        string? nextStep;
        if (user.SubscriptionStatus == "active" || user.SubscriptionStatus == "trialing")
        {
            nextStep = "dashboard";
        }
        else if (!string.IsNullOrWhiteSpace(user.PendingPlanCode))
        {
            nextStep = "checkout";
        }
        else
        {
            nextStep = "choose-plan";
        }

        return new VerifyEmailResultDto(true, null, user.Id, nextStep, user.PendingPlanCode, user.PendingBillingCycle);
    }
}
