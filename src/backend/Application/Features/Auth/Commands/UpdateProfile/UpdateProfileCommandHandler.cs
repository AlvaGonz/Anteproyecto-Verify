using System;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Persistence;
using Application.Abstractions.Security;

namespace Application.Features.Auth.Commands.UpdateProfile;

public record UpdateProfileResultDto(bool IsSuccess, string? ErrorMessage);

public class UpdateProfileCommandHandler
{
    private readonly IUsuarioRepository _usuarioRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateProfileCommandHandler(IUsuarioRepository usuarioRepository, IPasswordHasher passwordHasher, IUnitOfWork unitOfWork)
    {
        _usuarioRepository = usuarioRepository;
        _passwordHasher = passwordHasher;
        _unitOfWork = unitOfWork;
    }

    public async Task<UpdateProfileResultDto> Handle(UpdateProfileCommand request, CancellationToken cancellationToken)
    {
        var user = await _usuarioRepository.GetByIdAsync(request.UserId, cancellationToken);
        if (user == null)
            return new UpdateProfileResultDto(false, "Usuario no encontrado.");

        if (!string.IsNullOrWhiteSpace(request.NewPassword))
        {
            if (string.IsNullOrWhiteSpace(request.CurrentPassword))
                return new UpdateProfileResultDto(false, "Debe proveer su contraseña actual para cambiarla.");

            if (!_passwordHasher.VerifyPassword(request.CurrentPassword, user.ContrasenaHash))
                return new UpdateProfileResultDto(false, "La contraseña actual es incorrecta.");

            user.UpdatePassword(_passwordHasher.HashPassword(request.NewPassword));
        }

        var nombre = string.IsNullOrWhiteSpace(request.Nombre) ? user.Nombre : request.Nombre;
        var apellido = string.IsNullOrWhiteSpace(request.Apellido) ? user.Apellido : request.Apellido;
        var telefono = string.IsNullOrWhiteSpace(request.Telefono) ? user.Telefono : request.Telefono;
        
        user.UpdateProfile(nombre, apellido, telefono ?? "0000000000");

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new UpdateProfileResultDto(true, null);
    }
}
