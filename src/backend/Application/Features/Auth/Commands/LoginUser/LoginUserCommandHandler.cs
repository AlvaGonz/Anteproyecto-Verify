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
    private readonly IUnitOfWork _unitOfWork;

    public LoginUserCommandHandler(
        IUsuarioRepository usuarioRepository,
        IPasswordHasher passwordHasher,
        IJwtTokenGenerator jwtTokenGenerator,
        IUnitOfWork unitOfWork)
    {
        _usuarioRepository = usuarioRepository;
        _passwordHasher = passwordHasher;
        _jwtTokenGenerator = jwtTokenGenerator;
        _unitOfWork = unitOfWork;
    }

    public async Task<LoginUserResultDto> Handle(LoginUserCommand request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Email))
            return new LoginUserResultDto(false, "El correo electrónico es requerido.", null);

        if (string.IsNullOrWhiteSpace(request.Password))
            return new LoginUserResultDto(false, "La contraseña es requerida.", null);

        var user = await _usuarioRepository.GetByEmailAsync(request.Email.Trim().ToLower(), cancellationToken);
        if (user == null)
            return new LoginUserResultDto(false, "No encontramos una cuenta con este correo. ¿Desea registrarse?", null);

        if (!user.Activo)
            return new LoginUserResultDto(false, "La cuenta de usuario está inactiva.", null);

        if (user.AccountStatus == Domain.Enums.UserAccountStatus.PendingDeletion)
            return new LoginUserResultDto(false, "La cuenta está pendiente de eliminación.", null);

        if (!user.EmailVerificado && !user.TitularId.HasValue)
            return new LoginUserResultDto(false, "Debe verificar su correo electrónico antes de iniciar sesión.", null);

        var isPasswordValid = _passwordHasher.VerifyPassword(request.Password, user.ContrasenaHash);
        if (!isPasswordValid)
            return new LoginUserResultDto(false, "El correo electrónico o la contraseña son incorrectos.", null);

        // Auto-verify and activate guest users on first successful login
        if (!user.EmailVerificado && user.TitularId.HasValue)
        {
            user.ForzarVerificacionEmail();
            user.UpdateAccountStatus(Domain.Enums.UserAccountStatus.Active);
            
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }

        var roleStr = user.Rol == UserRole.Administrator ? "admin" : "user";

        // ponytail: if user was invited (has Titular), load titular's plan for guest display
        string? inviterPlan = null;
        if (user.TitularId.HasValue)
        {
            var titular = await _usuarioRepository.GetByIdWithPlanAsync(user.TitularId.Value, cancellationToken);
            inviterPlan = titular?.Plan?.NombrePlan;
        }

        var userDto = new LoginUserUserDto(
            user.Id,
            user.Email,
            user.NombreCompleto,
            roleStr,
            user.AvatarUrl,
            user.SubscriptionStatus,
            user.PendingPlanCode,
            user.PendingBillingCycle,
            IsGuest: user.TitularId.HasValue,
            InviterPlan: inviterPlan,
            InviteesList: user.MiembrosEquipo
                .Where(m => m.AccountStatus != Domain.Enums.UserAccountStatus.Purged && m.AccountStatus != Domain.Enums.UserAccountStatus.PendingDeletion)
                .Select(m => new {
                    id = m.Id,
                    nombre = m.Nombre,
                    apellido = m.Apellido,
                    email = m.CorreoElectronico,
                    estado = m.AccountStatus == Domain.Enums.UserAccountStatus.Invited ? "Pendiente" : 
                             (!m.EmailVerificado ? "Pendiente" : (m.Activo ? "Activo" : "Inactivo"))
                })
        );

        var token = _jwtTokenGenerator.GenerateToken(user);
        var response = new LoginUserResponseDto(userDto, token);

        return new LoginUserResultDto(true, null, response);
    }
}
