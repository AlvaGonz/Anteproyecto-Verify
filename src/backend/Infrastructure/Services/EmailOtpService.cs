using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions;
using Application.Abstractions.Persistence;
using Application.Abstractions.Security;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Application.Abstractions.Notifications;

namespace Infrastructure.Services;

public sealed record RequestEmailOtpCommand(string ChallengeToken);
public sealed record RequestEmailOtpResult(bool IsSuccess, string? ErrorMessage);

public sealed record VerifyEmailOtpCommand(string ChallengeToken, string? Code);
public sealed record VerifyEmailOtpResult(bool IsSuccess, string? ErrorMessage, string? Token, Guid? UsuarioId);

public sealed class EmailOtpService
{
    private readonly AppDbContext _db;
    private readonly IUsuarioRepository _usuarioRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ITwoFactorChallengeStore _challengeStore;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;
    private readonly IAuditLogger _audit;

    public static readonly TimeSpan OtpTtl = TimeSpan.FromMinutes(10);
    public const int OtpLength = 6;
    public const int MaxAttempts = 5;

    public EmailOtpService(
        AppDbContext db,
        IUsuarioRepository usuarioRepository,
        IUnitOfWork unitOfWork,
        ITwoFactorChallengeStore challengeStore,
        IJwtTokenGenerator jwtTokenGenerator,
        IAuditLogger audit)
    {
        _db = db;
        _usuarioRepository = usuarioRepository;
        _unitOfWork = unitOfWork;
        _challengeStore = challengeStore;
        _jwtTokenGenerator = jwtTokenGenerator;
        _audit = audit;
    }

    public async Task<RequestEmailOtpResult> Handle(RequestEmailOtpCommand request, CancellationToken cancellationToken)
    {
        // Peek the challenge without consuming it — resend must keep the same challenge live.
        var challenge = await _challengeStore.PeekAsync(request.ChallengeToken, cancellationToken);
        if (challenge is null)
            return new RequestEmailOtpResult(false, "Desafío inválido o expirado.");

        var user = await _usuarioRepository.GetByIdAsync(challenge.UsuarioId, cancellationToken);
        if (user is null)
            return new RequestEmailOtpResult(false, "Usuario no encontrado.");

        var existing = await _db.Verificaciones2FA
            .Where(v => v.SesionId == request.ChallengeToken)
            .ToListAsync(cancellationToken);
        if (existing.Count > 0)
        {
            _db.Verificaciones2FA.RemoveRange(existing);
            await _audit.AppendAsync(new AuditEntryDto
            {
                UsuarioId = user.Id,
                TipoOperacion = TipoOperacion.EmailOtpSolicitado,
                Accion = "Reemplazo de OTP de email por nueva solicitud",
                Resultado = "Reemplazado"
            }, cancellationToken);
        }

        var code = NewCode(OtpLength);
        var v = new Verificacion2FA(user.Id, request.ChallengeToken, code);
        _db.Verificaciones2FA.Add(v);
        user.MarkEmailOtpSent();
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await _audit.AppendAsync(new AuditEntryDto
        {
            UsuarioId = user.Id,
            TipoOperacion = TipoOperacion.EmailOtpSolicitado,
            Accion = "OTP de email solicitado",
            Resultado = "Éxito"
        }, cancellationToken);

        return new RequestEmailOtpResult(true, null);
    }

    public async Task<VerifyEmailOtpResult> HandleVerify(VerifyEmailOtpCommand request, CancellationToken cancellationToken)
    {
        var challenge = await _challengeStore.PeekAsync(request.ChallengeToken, cancellationToken);
        if (challenge is null)
            return new VerifyEmailOtpResult(false, "Desafío inválido o expirado.", null, null);

        var user = await _usuarioRepository.GetByIdAsync(challenge.UsuarioId, cancellationToken);
        if (user is null)
            return new VerifyEmailOtpResult(false, "Usuario no encontrado.", null, null);

        if (user.Is2FALockedOut)
            return new VerifyEmailOtpResult(false, "Demasiados intentos. Intente más tarde.", null, null);

        var active = await _db.Verificaciones2FA
            .Where(v => v.UsuarioId == user.Id && v.SesionId == challenge.ChallengeToken)
            .OrderByDescending(v => v.FechaCreacion)
            .FirstOrDefaultAsync(cancellationToken);

        if (active is null)
            return new VerifyEmailOtpResult(false, "No hay OTP activo para este desafío.", null, null);

        if (active.FechaCreacion.Add(OtpTtl) <= DateTime.UtcNow)
        {
            _db.Verificaciones2FA.Remove(active);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return new VerifyEmailOtpResult(false, "OTP expirado.", null, null);
        }

        if (string.IsNullOrEmpty(request.Code) || !string.Equals(active.NumeroVerificable, request.Code, StringComparison.Ordinal))
        {
            user.Register2FAFailure();
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            await _audit.AppendAsync(new AuditEntryDto
            {
                UsuarioId = user.Id,
                TipoOperacion = TipoOperacion.TwoFactorFallido,
                Accion = "Código OTP de email inválido",
                Resultado = "Fallido"
            }, cancellationToken);
            return new VerifyEmailOtpResult(false, "Código inválido.", null, null);
        }

        // Consume challenge on success
        await _challengeStore.ConsumeAsync(request.ChallengeToken, cancellationToken);
        _db.Verificaciones2FA.Remove(active);
        user.Register2FASuccess();
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var token = _jwtTokenGenerator.GenerateToken(user, mfaAuthenticated: true);
        await _audit.AppendAsync(new AuditEntryDto
        {
            UsuarioId = user.Id,
            TipoOperacion = TipoOperacion.EmailOtpUsado,
            Accion = "Verificación de segundo factor (email OTP)",
            Resultado = "Éxito"
        }, cancellationToken);

        return new VerifyEmailOtpResult(true, null, token, user.Id);
    }

    public static string NewCode(int length)
    {
        var buf = new char[length];
        for (var i = 0; i < length; i++)
            buf[i] = (char)('0' + System.Security.Cryptography.RandomNumberGenerator.GetInt32(0, 10));
        return new string(buf);
    }
}
