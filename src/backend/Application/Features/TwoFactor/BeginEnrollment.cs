namespace Application.Features.TwoFactor;

using System;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions;
using Application.Abstractions.Persistence;
using Application.Abstractions.Security;
using Application.Features.Auth.Commands.LoginUser;
using Domain.Enums;

public sealed record BeginEnrollmentCommand(Guid UsuarioId);
public sealed record BeginEnrollmentResult(bool IsSuccess, string? ErrorMessage, string ErrorCode, string? Secret, string? OtpAuthUri);

public sealed class BeginEnrollmentCommandHandler
{
    private readonly IUsuarioRepository _usuarioRepository;
    private readonly ITotpService _totpService;
    private readonly ITwoFactorSecretProtector _secretProtector;
    private readonly IUnitOfWork _unitOfWork;

    public BeginEnrollmentCommandHandler(
        IUsuarioRepository usuarioRepository,
        ITotpService totpService,
        ITwoFactorSecretProtector secretProtector,
        IUnitOfWork unitOfWork)
    {
        _usuarioRepository = usuarioRepository;
        _totpService = totpService;
        _secretProtector = secretProtector;
        _unitOfWork = unitOfWork;
    }

    public async Task<BeginEnrollmentResult> Handle(BeginEnrollmentCommand request, CancellationToken cancellationToken)
    {
        var user = await _usuarioRepository.GetByIdAsync(request.UsuarioId, cancellationToken);
        if (user is null)
            return new BeginEnrollmentResult(false, null, Application.Common.Errors.TwoFactorErrorCode.Unknown, null, null);

        if (user.TwoFactorEnabled)
            return new BeginEnrollmentResult(false, null, Application.Common.Errors.TwoFactorErrorCode.EnrollmentAlreadyActive, null, null);

        var plainSecret = _totpService.GenerateSecret();
        var encrypted = _secretProtector.Protect(plainSecret);
        user.Begin2FAEnrollment(encrypted);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var issuer = "VeriFinca";
        var uri = _totpService.BuildOtpAuthUri(user.Email, plainSecret, issuer);
        return new BeginEnrollmentResult(true, null, Application.Common.Errors.TwoFactorErrorCode.Unknown, plainSecret, uri);
    }
}
