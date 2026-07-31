namespace Application.Features.TwoFactor;

using System;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions;
using Application.Abstractions.Persistence;
using Application.Abstractions.Security;
using Domain.Enums;

public sealed record Disable2FACommand(Guid UsuarioId, string Password, int Code);
public sealed record Disable2FAResult(bool IsSuccess, string? ErrorMessage);

public sealed class Disable2FACommandHandler
{
    private readonly IUsuarioRepository _usuarioRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ITotpService _totpService;
    private readonly ITwoFactorSecretProtector _secretProtector;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IAuditLogger _audit;

    public Disable2FACommandHandler(
        IUsuarioRepository usuarioRepository,
        IPasswordHasher passwordHasher,
        ITotpService totpService,
        ITwoFactorSecretProtector secretProtector,
        IUnitOfWork unitOfWork,
        IAuditLogger audit)
    {
        _usuarioRepository = usuarioRepository;
        _passwordHasher = passwordHasher;
        _totpService = totpService;
        _secretProtector = secretProtector;
        _unitOfWork = unitOfWork;
        _audit = audit;
    }

    public async Task<Disable2FAResult> Handle(Disable2FACommand request, CancellationToken cancellationToken)
    {
        var user = await _usuarioRepository.GetByIdAsync(request.UsuarioId, cancellationToken);
        if (user is null)
            return new Disable2FAResult(false, "Usuario no encontrado.");

        if (!user.TwoFactorEnabled)
            return new Disable2FAResult(false, "El usuario no tiene 2FA activado.");

        if (string.IsNullOrWhiteSpace(user.TwoFactorSecretEncrypted))
            return new Disable2FAResult(false, "Estado de 2FA inválido.");

        if (!_passwordHasher.VerifyPassword(request.Password, user.ContrasenaHash))
            return new Disable2FAResult(false, "Contraseña incorrecta.");

        var plainSecret = _secretProtector.Unprotect(user.TwoFactorSecretEncrypted);
        if (!_totpService.ValidateCode(plainSecret, request.Code))
            return new Disable2FAResult(false, "Código TOTP inválido.");

        user.Disable2FA();
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await _audit.AppendAsync(new AuditEntryDto
        {
            UsuarioId = user.Id,
            TipoOperacion = TipoOperacion.TwoFactorDesactivado,
            Accion = "Desactivación de segundo factor",
            Resultado = "Éxito"
        }, cancellationToken);

        return new Disable2FAResult(true, null);
    }
}
