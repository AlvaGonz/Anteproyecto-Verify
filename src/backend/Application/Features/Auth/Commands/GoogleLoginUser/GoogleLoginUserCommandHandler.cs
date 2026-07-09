namespace Application.Features.Auth.Commands.GoogleLoginUser;

using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Persistence;
using Application.Abstractions.Security;
using Application.Features.Auth.Commands.LoginUser;
using Domain.Entities;
using Domain.Enums;

public class GoogleLoginUserCommandHandler
{
    private readonly IUsuarioRepository _usuarioRepository;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;
    private readonly IGoogleAuthService _googleAuthService;
    private readonly IPlanSuscripcionRepository _planRepository;
    private readonly IUnitOfWork _unitOfWork;

    public GoogleLoginUserCommandHandler(
        IUsuarioRepository usuarioRepository,
        IJwtTokenGenerator jwtTokenGenerator,
        IGoogleAuthService googleAuthService,
        IPlanSuscripcionRepository planRepository,
        IUnitOfWork unitOfWork)
    {
        _usuarioRepository = usuarioRepository;
        _jwtTokenGenerator = jwtTokenGenerator;
        _googleAuthService = googleAuthService;
        _planRepository = planRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<LoginUserResultDto> Handle(GoogleLoginUserCommand request, CancellationToken cancellationToken)
    {
        var profile = await _googleAuthService.VerifyTokenAsync(request.Credential, cancellationToken);
        if (profile == null)
        {
            return new LoginUserResultDto(false, "Token de Google inválido.", null);
        }

        var user = await _usuarioRepository.GetByEmailAsync(profile.Email.Trim().ToLower(), cancellationToken);

        if (user == null)
        {
            // Dummy unreachable password hash for Google-only users
            string dummyHash = "[GOOGLE_AUTH_NO_PASSWORD]";
            
            // Use GivenName/FamilyName directly instead of splitting Name
            var nombre = !string.IsNullOrWhiteSpace(profile.GivenName) ? profile.GivenName : "Usuario";
            var apellido = !string.IsNullOrWhiteSpace(profile.FamilyName) ? profile.FamilyName : "Google";

            user = new Usuario(
                nombre,
                apellido,
                profile.Email.Trim().ToLower(),
                dummyHash,
                UserRole.User,
                "0000000000", // dummy default
                "00000000000" // dummy default
            );

            user.VincularGoogleAccount(profile.Sub);

            if (!string.IsNullOrEmpty(profile.Picture))
            {
                user.UpdateAvatarUrl(profile.Picture);
            }

            var consultorPlan = await _planRepository.GetByNameAsync("Gratuito", cancellationToken);
            if (consultorPlan != null)
            {
                user.AsignarPlan(consultorPlan.Idsuscripcion);
            }

            await _usuarioRepository.AddAsync(user, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }
        else
        {
            if (!user.Activo)
                return new LoginUserResultDto(false, "La cuenta de usuario está inactiva.", null);

            if (user.AccountStatus == UserAccountStatus.PendingDeletion)
                return new LoginUserResultDto(false, "La cuenta está pendiente de eliminación.", null);

            // Vinculate account if not already linked
            if (!user.SocialLogin || user.GoogleId != profile.Sub)
            {
                user.VincularGoogleAccount(profile.Sub);
                await _unitOfWork.SaveChangesAsync(cancellationToken);
            }
        }

        var roleStr = user.Rol == UserRole.Administrator ? "admin" : "user";
        var userDto = new LoginUserUserDto(
            user.Id,
            user.Email,
            user.NombreCompleto,
            roleStr,
            user.AvatarUrl,
            user.SubscriptionStatus,
            user.PendingPlanCode,
            user.PendingBillingCycle
        );

        var token = _jwtTokenGenerator.GenerateToken(user);
        var response = new LoginUserResponseDto(userDto, token);

        return new LoginUserResultDto(true, null, response);
    }
}
