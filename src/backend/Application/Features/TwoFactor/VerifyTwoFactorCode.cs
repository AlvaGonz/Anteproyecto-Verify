namespace Application.Features.TwoFactor;

using System;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions;
using Application.Abstractions.Persistence;
using Application.Abstractions.Security;
using Domain.Enums;

public sealed record VerifyTwoFactorCodeCommand(string ChallengeToken, int Code);
public sealed record VerifyTwoFactorCodeResult(bool IsSuccess, string? ErrorMessage, string? Token, Guid? UsuarioId);

public sealed class VerifyTwoFactorCodeCommandHandler
{
    private readonly ITwoFactorChallengeStore _challengeStore;
    private readonly IUsuarioRepository _usuarioRepository;
    private readonly ITotpService _totpService;
    private readonly ITwoFactorSecretProtector _secretProtector;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IAuditLogger _audit;

    public VerifyTwoFactorCodeCommandHandler(
        ITwoFactorChallengeStore challengeStore,
        IUsuarioRepository usuarioRepository,
        ITotpService totpService,
        ITwoFactorSecretProtector secretProtector,
        IJwtTokenGenerator jwtTokenGenerator,
        IUnitOfWork unitOfWork,
        IAuditLogger audit)
    {
        _challengeStore = challengeStore;
        _usuarioRepository = usuarioRepository;
        _totpService = totpService;
        _secretProtector = secretProtector;
        _jwtTokenGenerator = jwtTokenGenerator;
        _unitOfWork = unitOfWork;
        _audit = audit;
    }

    public async Task<VerifyTwoFactorCodeResult> Handle(VerifyTwoFactorCodeCommand request, CancellationToken cancellationToken)
    {
        var challenge = await _challengeStore.PeekAsync(request.ChallengeToken, cancellationToken);
        if (challenge is null)
            return new VerifyTwoFactorCodeResult(false, "Desafío inválido o expirado.", null, null);

        var user = await _usuarioRepository.GetByIdAsync(challenge.UsuarioId, cancellationToken);
        if (user is null || !user.TwoFactorEnabled || string.IsNullOrWhiteSpace(user.TwoFactorSecretEncrypted))
            return new VerifyTwoFactorCodeResult(false, "Desafío inválido.", null, null);

        if (user.Is2FALockedOut)
            return new VerifyTwoFactorCodeResult(false, "Demasiados intentos fallidos. Intente más tarde.", null, null);

        var plainSecret = _secretProtector.Unprotect(user.TwoFactorSecretEncrypted);
        if (!_totpService.ValidateCode(plainSecret, request.Code))
        {
            user.Register2FAFailure();
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            await _audit.AppendAsync(new AuditEntryDto
            {
                UsuarioId = user.Id,
                TipoOperacion = TipoOperacion.TwoFactorFallido,
                Accion = "Código TOTP inválido",
                Resultado = "Fallido"
            }, cancellationToken);
            return new VerifyTwoFactorCodeResult(false, "Código TOTP inválido.", null, null);
        }

        await _challengeStore.ConsumeAsync(request.ChallengeToken, cancellationToken);
        user.Register2FASuccess();
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var token = _jwtTokenGenerator.GenerateToken(user, mfaAuthenticated: true);
        await _audit.AppendAsync(new AuditEntryDto
        {
            UsuarioId = user.Id,
            TipoOperacion = TipoOperacion.TwoFactorVerificado,
            Accion = "Verificación de segundo factor (TOTP)",
            Resultado = "Éxito"
        }, cancellationToken);

        return new VerifyTwoFactorCodeResult(true, null, token, user.Id);
    }
}
