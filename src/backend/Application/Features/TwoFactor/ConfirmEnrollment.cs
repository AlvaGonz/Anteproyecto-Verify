namespace Application.Features.TwoFactor;

using System;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions;
using Application.Abstractions.Persistence;
using Application.Abstractions.Security;
using Domain.Enums;

public sealed record ConfirmEnrollmentCommand(Guid UsuarioId, int Code);
public sealed record ConfirmEnrollmentResult(bool IsSuccess, string? ErrorMessage, IReadOnlyList<string>? RecoveryCodes);

public sealed class ConfirmEnrollmentCommandHandler
{
    private readonly IUsuarioRepository _usuarioRepository;
    private readonly ITotpService _totpService;
    private readonly ITwoFactorSecretProtector _secretProtector;
    private readonly IRecoveryCodeService _recoveryCodes;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IAuditLogger _audit;

    public ConfirmEnrollmentCommandHandler(
        IUsuarioRepository usuarioRepository,
        ITotpService totpService,
        ITwoFactorSecretProtector secretProtector,
        IRecoveryCodeService recoveryCodes,
        IUnitOfWork unitOfWork,
        IAuditLogger audit)
    {
        _usuarioRepository = usuarioRepository;
        _totpService = totpService;
        _secretProtector = secretProtector;
        _recoveryCodes = recoveryCodes;
        _unitOfWork = unitOfWork;
        _audit = audit;
    }

    public async Task<ConfirmEnrollmentResult> Handle(ConfirmEnrollmentCommand request, CancellationToken cancellationToken)
    {
        var user = await _usuarioRepository.GetByIdAsync(request.UsuarioId, cancellationToken);
        if (user is null)
            return new ConfirmEnrollmentResult(false, "Usuario no encontrado.", null);

        if (user.TwoFactorEnabled)
            return new ConfirmEnrollmentResult(false, "El usuario ya tiene 2FA activado.", null);

        if (string.IsNullOrWhiteSpace(user.TwoFactorSecretEncrypted))
            return new ConfirmEnrollmentResult(false, "No hay una inscripción pendiente. Inicie una inscripción primero.", null);

        if (user.Is2FALockedOut)
            return new ConfirmEnrollmentResult(false, "Demasiados intentos fallidos. Intente más tarde.", null);

        var plainSecret = _secretProtector.Unprotect(user.TwoFactorSecretEncrypted);
        if (!_totpService.ValidateCode(plainSecret, request.Code))
        {
            user.Register2FAFailure();
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            await _audit.AppendAsync(new AuditEntryDto
            {
                UsuarioId = user.Id,
                TipoOperacion = TipoOperacion.TwoFactorFallido,
                Accion = "Código TOTP inválido durante confirmación de inscripción",
                Resultado = "Fallido"
            }, cancellationToken);
            return new ConfirmEnrollmentResult(false, "Código TOTP inválido.", null);
        }

        var set = _recoveryCodes.Generate(10);
        user.Confirm2FAEnrollment(set.HashedJson);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await _audit.AppendAsync(new AuditEntryDto
        {
            UsuarioId = user.Id,
            TipoOperacion = TipoOperacion.TwoFactorActivado,
            Accion = "Activación de segundo factor (TOTP)",
            Resultado = "Éxito"
        }, cancellationToken);

        return new ConfirmEnrollmentResult(true, null, set.PlainCodes);
    }
}
