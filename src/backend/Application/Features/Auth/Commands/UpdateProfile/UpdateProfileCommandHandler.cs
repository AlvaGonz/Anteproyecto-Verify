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
            user.UpdatePassword(_passwordHasher.HashPassword(request.NewPassword));

        var nombre = string.IsNullOrWhiteSpace(request.Nombre) ? user.Nombre : request.Nombre;
        var apellido = string.IsNullOrWhiteSpace(request.Apellido) ? user.Apellido : request.Apellido;
        var telefono = string.IsNullOrWhiteSpace(request.Telefono) ? user.Telefono : request.Telefono;

        user.UpdateProfile(nombre, apellido, telefono ?? "0000000000");

        // Update cedula if provided
        if (request.Cedula != null)
        {
            var cedulaClean = request.Cedula.Replace("-", "").Trim();
            user.UpdateContactInfo(telefono ?? user.Telefono, cedulaClean);
        }

        if (request.Rnc != null)
        {
            user.UpdateRnc(
                string.IsNullOrWhiteSpace(request.Rnc) ? null! : request.Rnc,
                string.IsNullOrWhiteSpace(request.RazonSocial) ? null : request.RazonSocial,
                string.IsNullOrWhiteSpace(request.NombreComercial) ? null : request.NombreComercial,
                string.IsNullOrWhiteSpace(request.ActividadEconomica) ? null : request.ActividadEconomica
            );
        }

        // Profile extension fields (Direccion, Provincia, Nickname)
        if (request.Nickname != null)
        {
            var trimmedNickname = request.Nickname.Trim();
            if (trimmedNickname.Length < 3 || trimmedNickname.Length > 30)
                return new UpdateProfileResultDto(false, "El apodo debe tener entre 3 y 30 caracteres.");

            var existingWithNickname = await _usuarioRepository.GetByNicknameAsync(trimmedNickname, cancellationToken);
            if (existingWithNickname != null && existingWithNickname.Id != request.UserId)
                return new UpdateProfileResultDto(false, "El apodo ya está en uso por otro usuario.");
        }

        user.UpdateProfileExtension(
            request.Direccion,
            request.Provincia,
            request.Nickname
        );

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new UpdateProfileResultDto(true, null);
    }
}
