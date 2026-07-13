using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Persistence;
using Application.Abstractions.Security;
using FluentValidation;

namespace Application.Features.Auth.Commands.ResetPassword;

public class ResetPasswordCommandHandler
{
    private readonly IUsuarioRepository _usuarioRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IValidator<ResetPasswordCommand> _validator;

    public ResetPasswordCommandHandler(
        IUsuarioRepository usuarioRepository,
        IPasswordHasher passwordHasher,
        IUnitOfWork unitOfWork,
        IValidator<ResetPasswordCommand> validator)
    {
        _usuarioRepository = usuarioRepository;
        _passwordHasher = passwordHasher;
        _unitOfWork = unitOfWork;
        _validator = validator;
    }

    public async Task<ResetPasswordResponseDto> Handle(ResetPasswordCommand request, CancellationToken cancellationToken)
    {
        var validationResult = await _validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            return new ResetPasswordResponseDto(false, string.Join(", ", validationResult.Errors.Select(e => e.ErrorMessage)));
        }

        var user = await _usuarioRepository.GetByPasswordResetTokenAsync(request.Token, cancellationToken);
        if (user is null || !user.IsPasswordResetTokenValid())
        {
            return new ResetPasswordResponseDto(false, "El token de recuperación es inválido o ha expirado.");
        }

        var hashedPassword = _passwordHasher.HashPassword(request.NewPassword);
        user.UpdatePassword(hashedPassword);
        user.ClearPasswordResetToken();

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new ResetPasswordResponseDto(true, null);
    }
}
