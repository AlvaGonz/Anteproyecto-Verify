namespace Application.Features.Auth.Commands.RegisterUser;

using System;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Persistence;
using Application.Abstractions.Security;
using Domain.Entities;
using Domain.Enums;
using FluentValidation;

public class RegisterUserCommandHandler
{
    private readonly IUsuarioRepository _usuarioRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IValidator<RegisterUserCommand> _validator;

    public RegisterUserCommandHandler(
        IUsuarioRepository usuarioRepository,
        IPasswordHasher passwordHasher,
        IUnitOfWork unitOfWork,
        IValidator<RegisterUserCommand> validator)
    {
        _usuarioRepository = usuarioRepository;
        _passwordHasher = passwordHasher;
        _unitOfWork = unitOfWork;
        _validator = validator;
    }

    public async Task<RegisterUserResultDto> Handle(RegisterUserCommand request, CancellationToken cancellationToken)
    {
        var validationResult = await _validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            var errorMessage = string.Join(" ", validationResult.Errors.Select(e => e.ErrorMessage));
            return new RegisterUserResultDto(false, errorMessage, null);
        }

        // 5. Verificar si el correo ya existe
        var existingUser = await _usuarioRepository.GetByEmailAsync(request.Email, cancellationToken);
        if (existingUser != null)
            return new RegisterUserResultDto(false, "El correo electrónico ya está registrado en la plataforma.", null);

        // 6. Hashear la contraseña con BCrypt
        var passwordHash = _passwordHasher.HashPassword(request.Password);

        // 7. Crear el usuario (por defecto rol Professional / desarrollador)
        var user = new Usuario(
            request.Nombre.Trim(),
            request.Apellido.Trim(),
            request.Email.Trim().ToLower(),
            passwordHash,
            UserRole.Professional,
            request.Telefono!.Trim(),
            request.Cedula!.Trim()
        );

        // 8. Guardar en Base de Datos
        await _usuarioRepository.AddAsync(user, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new RegisterUserResultDto(true, null, user.Id);
    }
}
