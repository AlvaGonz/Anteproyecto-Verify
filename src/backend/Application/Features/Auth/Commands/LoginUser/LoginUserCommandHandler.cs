namespace Application.Features.Auth.Commands.LoginUser;

using System;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Persistence;
using Application.Abstractions.Security;
using Domain.Enums;

public class LoginUserCommandHandler
{
    private readonly IUsuarioRepository _usuarioRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;

    public LoginUserCommandHandler(
        IUsuarioRepository usuarioRepository,
        IPasswordHasher passwordHasher,
        IJwtTokenGenerator jwtTokenGenerator)
    {
        _usuarioRepository = usuarioRepository;
        _passwordHasher = passwordHasher;
        _jwtTokenGenerator = jwtTokenGenerator;
    }

    public async Task<LoginUserResultDto> Handle(LoginUserCommand request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Email))
            return new LoginUserResultDto(false, "El correo electrónico es requerido.", null);

        if (string.IsNullOrWhiteSpace(request.Password))
            return new LoginUserResultDto(false, "La contraseña es requerida.", null);

        var user = await _usuarioRepository.GetByEmailAsync(request.Email.Trim().ToLower(), cancellationToken);
        if (user == null)
            return new LoginUserResultDto(false, "El correo electrónico o la contraseña son incorrectos.", null);

        if (!user.Activo)
            return new LoginUserResultDto(false, "La cuenta de usuario está inactiva.", null);

        if (user.AccountStatus == Domain.Enums.UserAccountStatus.PendingDeletion)
            return new LoginUserResultDto(false, "La cuenta está pendiente de eliminación.", null);

        if (!user.EmailVerificado)
            return new LoginUserResultDto(false, "Debe verificar su correo electrónico antes de iniciar sesión.", null);

        var isPasswordValid = _passwordHasher.VerifyPassword(request.Password, user.ContrasenaHash);
        if (!isPasswordValid)
            return new LoginUserResultDto(false, "El correo electrónico o la contraseña son incorrectos.", null);

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
