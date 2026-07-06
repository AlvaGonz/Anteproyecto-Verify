using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Notifications;
using Application.Abstractions.Persistence;
using Domain.Entities;
using FluentValidation;

namespace Application.Features.Auth.Commands.ResendVerificationEmail;

public class ResendVerificationEmailCommandHandler
{
    private readonly IUsuarioRepository _usuarioRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IValidator<ResendVerificationEmailCommand> _validator;
    private readonly IEmailService _emailService;

    public ResendVerificationEmailCommandHandler(
        IUsuarioRepository usuarioRepository,
        IUnitOfWork unitOfWork,
        IValidator<ResendVerificationEmailCommand> validator,
        IEmailService emailService)
    {
        _usuarioRepository = usuarioRepository;
        _unitOfWork = unitOfWork;
        _validator = validator;
        _emailService = emailService;
    }

    public async Task<ResendVerificationEmailResultDto> Handle(ResendVerificationEmailCommand request, CancellationToken cancellationToken)
    {
        var validationResult = await _validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            return new ResendVerificationEmailResultDto(false, string.Join(", ", validationResult.Errors.Select(e => e.ErrorMessage)));
        }

        var user = await _usuarioRepository.GetByEmailAsync(request.Email, cancellationToken);
        if (user is null)
        {
            // Security: don't reveal that the user does not exist
            return new ResendVerificationEmailResultDto(true, null);
        }

        if (user.EmailVerificado)
        {
            return new ResendVerificationEmailResultDto(false, "La cuenta ya está verificada.");
        }

        user.GenerarTokenVerificacion();
        
        await _emailService.SendAccountVerificationAsync(
            user.Email,
            user.Nombre,
            user.TokenVerificacion!,
            request.ReturnUrl,
            cancellationToken
        );

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new ResendVerificationEmailResultDto(true, null);
    }
}
