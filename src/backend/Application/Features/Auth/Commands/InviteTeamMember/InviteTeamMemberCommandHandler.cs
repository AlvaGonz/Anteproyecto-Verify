namespace Application.Features.Auth.Commands.InviteTeamMember;

using System;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Notifications;
using Application.Abstractions.Persistence;
using Application.Abstractions.Security;
using Domain.Entities;
using Domain.Enums;
using Domain.Policies;

public class InviteTeamMemberCommandHandler
{
    private readonly IUsuarioRepository _usuarioRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IPasswordHasher _passwordHasher;
    private readonly INotificationFactory _notificationFactory;
    private readonly INotificacionRepository _notificacionRepository;

    public InviteTeamMemberCommandHandler(
        IUsuarioRepository usuarioRepository, 
        IUnitOfWork unitOfWork,
        IPasswordHasher passwordHasher,
        INotificationFactory notificationFactory,
        INotificacionRepository notificacionRepository)
    {
        _usuarioRepository = usuarioRepository;
        _unitOfWork = unitOfWork;
        _passwordHasher = passwordHasher;
        _notificationFactory = notificationFactory;
        _notificacionRepository = notificacionRepository;
    }

    public async Task<InviteTeamMemberResult> Handle(InviteTeamMemberCommand request, CancellationToken cancellationToken)
    {
        var titular = await _usuarioRepository.GetByIdWithPlanAsync(request.TitularId, cancellationToken);
        if (titular == null)
        {
            return new InviteTeamMemberResult(false, "El titular especificado no existe.");
        }

        var miembrosActuales = titular.MiembrosEquipo?.Count ?? 0;
        
        if (!SubscriptionTierPolicy.CanAddTeamMember(titular, miembrosActuales))
        {
            return new InviteTeamMemberResult(false, "Límite de usuarios de equipo alcanzado para el plan de suscripción actual.");
        }

        var existeCorreo = await _usuarioRepository.GetByEmailAsync(request.CorreoElectronico, cancellationToken);
        if (existeCorreo != null)
        {
            return new InviteTeamMemberResult(false, "El correo electrónico ya está registrado.");
        }

        // Generate a temporary password
        var tempPassword = Guid.NewGuid().ToString("N").Substring(0, 10) + "A!";
        var contrasenaHash = _passwordHasher.HashPassword(tempPassword);

        var nuevoUsuario = new Usuario(
            request.Nombre,
            request.Apellido,
            request.CorreoElectronico,
            contrasenaHash,
            titular.Rol,
            request.Telefono ?? "000-0000000",
            null // Provisional DNI - empty until member completes profile
        );

        nuevoUsuario.AsignarTitular(request.TitularId);
        if (titular.PlanSuscripcionId.HasValue)
        {
            nuevoUsuario.AsignarPlan(titular.PlanSuscripcionId.Value); // Hereda el plan
        }

        await _usuarioRepository.AddAsync(nuevoUsuario, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var notif = await _notificationFactory.CreateAsync(nuevoUsuario.Id,
            TipoNotificacionId.InvitacionRecibida,
            $"{titular.NombreCompleto} te ha invitado a su equipo en VeriFinca.",
            "/dashboard");
        await _notificacionRepository.AddAsync(notif, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // TODO: Send email with temp password (outside this scope but conceptually needed)

        return new InviteTeamMemberResult(true, "Usuario de equipo invitado exitosamente. Se ha enviado un correo con la contraseña temporal.", nuevoUsuario.Id);
    }
}
