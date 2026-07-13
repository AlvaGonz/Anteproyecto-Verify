using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Notifications;
using Application.Abstractions.Persistence;
using FluentValidation;

namespace Application.Features.Auth.Commands.ForgotPassword;

public class ForgotPasswordCommandHandler
{
    private readonly IUsuarioRepository _usuarioRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IValidator<ForgotPasswordCommand> _validator;
    private readonly IEmailService _emailService;

    public ForgotPasswordCommandHandler(
        IUsuarioRepository usuarioRepository,
        IUnitOfWork unitOfWork,
        IValidator<ForgotPasswordCommand> validator,
        IEmailService emailService)
    {
        _usuarioRepository = usuarioRepository;
        _unitOfWork = unitOfWork;
        _validator = validator;
        _emailService = emailService;
    }

    public async Task<ForgotPasswordResponseDto> Handle(ForgotPasswordCommand request, CancellationToken cancellationToken)
    {
        var validationResult = await _validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            return new ForgotPasswordResponseDto(false, string.Join(", ", validationResult.Errors.Select(e => e.ErrorMessage)));
        }

        var user = await _usuarioRepository.GetByEmailAsync(request.Email, cancellationToken);
        if (user is null)
        {
            // Security: don't reveal that the user does not exist
            return new ForgotPasswordResponseDto(true, null);
        }

        user.GenerarTokenRecuperacion();
        
        // This method will be added to IEmailService
        await _emailService.SendPasswordResetAsync(
            user.Email,
            user.Nombre,
            user.PasswordResetToken!,
            null,
            cancellationToken
        );

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new ForgotPasswordResponseDto(true, null);
    }
}
