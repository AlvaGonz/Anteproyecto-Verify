namespace Application.Features.TwoFactor;

using System;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions;
using Application.Abstractions.Persistence;
using Application.Abstractions.Security;
using Domain.Enums;

public sealed record ConsumeRecoveryCodeCommand(string ChallengeToken, string Code);
public sealed record ConsumeRecoveryCodeResult(bool IsSuccess, string? ErrorMessage, string? Token, Guid? UsuarioId);

public sealed class ConsumeRecoveryCodeCommandHandler
{
    private readonly ITwoFactorChallengeStore _challengeStore;
    private readonly IUsuarioRepository _usuarioRepository;
    private readonly IRecoveryCodeService _recoveryCodes;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IAuditLogger _audit;

    public ConsumeRecoveryCodeCommandHandler(
        ITwoFactorChallengeStore challengeStore,
        IUsuarioRepository usuarioRepository,
        IRecoveryCodeService recoveryCodes,
        IJwtTokenGenerator jwtTokenGenerator,
        IUnitOfWork unitOfWork,
        IAuditLogger audit)
    {
        _challengeStore = challengeStore;
        _usuarioRepository = usuarioRepository;
        _recoveryCodes = recoveryCodes;
        _jwtTokenGenerator = jwtTokenGenerator;
        _unitOfWork = unitOfWork;
        _audit = audit;
    }

    public async Task<ConsumeRecoveryCodeResult> Handle(ConsumeRecoveryCodeCommand request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Code))
            return new ConsumeRecoveryCodeResult(false, "Código de recuperación requerido.", null, null);

        var challenge = await _challengeStore.PeekAsync(request.ChallengeToken, cancellationToken);
        if (challenge is null)
            return new ConsumeRecoveryCodeResult(false, "Desafío inválido o expirado.", null, null);

        var user = await _usuarioRepository.GetByIdAsync(challenge.UsuarioId, cancellationToken);
        if (user is null || !user.TwoFactorEnabled || string.IsNullOrWhiteSpace(user.RecoveryCodesHashJson))
            return new ConsumeRecoveryCodeResult(false, "Desafío inválido.", null, null);

        if (!_recoveryCodes.Consume(user.RecoveryCodesHashJson, request.Code, out var newJson))
        {
            await _audit.AppendAsync(new AuditEntryDto
            {
                UsuarioId = user.Id,
                TipoOperacion = TipoOperacion.TwoFactorFallido,
                Accion = "Código de recuperación inválido",
                Resultado = "Fallido"
            }, cancellationToken);
            return new ConsumeRecoveryCodeResult(false, "Código de recuperación inválido.", null, null);
        }

        await _challengeStore.ConsumeAsync(request.ChallengeToken, cancellationToken);
        user.ReplaceRecoveryCodes(newJson);
        user.Register2FASuccess();
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var token = _jwtTokenGenerator.GenerateToken(user, mfaAuthenticated: true);
        await _audit.AppendAsync(new AuditEntryDto
        {
            UsuarioId = user.Id,
            TipoOperacion = TipoOperacion.CodigoRecuperacionUsado,
            Accion = "Verificación de segundo factor (código de recuperación)",
            Resultado = "Éxito"
        }, cancellationToken);

        return new ConsumeRecoveryCodeResult(true, null, token, user.Id);
    }
}
