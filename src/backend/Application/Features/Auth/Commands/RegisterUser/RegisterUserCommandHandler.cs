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

public class RegisterUserCommandHandler
{
    private readonly IUsuarioRepository _usuarioRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IUnitOfWork _unitOfWork;

    private static readonly Regex EmailRegex = new Regex(@"^[^@\s]+@[^@\s]+\.[^@\s]+$", RegexOptions.Compiled | RegexOptions.IgnoreCase);
    private static readonly Regex PhoneRegex = new Regex(@"^\+?[0-9]{1,3}?[-.\s]?([0-9]{3})[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$", RegexOptions.Compiled);

    public RegisterUserCommandHandler(
        IUsuarioRepository usuarioRepository,
        IPasswordHasher passwordHasher,
        IUnitOfWork unitOfWork)
    {
        _usuarioRepository = usuarioRepository;
        _passwordHasher = passwordHasher;
        _unitOfWork = unitOfWork;
    }

    public async Task<RegisterUserResultDto> Handle(RegisterUserCommand request, CancellationToken cancellationToken)
    {
        // 1. Validaciones básicas de campos vacíos
        if (string.IsNullOrWhiteSpace(request.Nombre))
            return new RegisterUserResultDto(false, "El nombre es requerido.", null);
        
        if (string.IsNullOrWhiteSpace(request.Apellido))
            return new RegisterUserResultDto(false, "El apellido es requerido.", null);

        if (string.IsNullOrWhiteSpace(request.Email))
            return new RegisterUserResultDto(false, "El correo electrónico es requerido.", null);

        if (string.IsNullOrWhiteSpace(request.Password))
            return new RegisterUserResultDto(false, "La contraseña es requerida.", null);

        // 2. Validación de Correo Electrónico (contiene '@' y es un correo válido)
        if (!request.Email.Contains("@") || !EmailRegex.IsMatch(request.Email))
            return new RegisterUserResultDto(false, "El correo electrónico no tiene un formato válido (debe contener '@' y un dominio correcto).", null);

        // 3. Validación de Contraseña (mínimo 8 caracteres, al menos 1 mayúscula, al menos 1 minúscula, números y al menos 1 signo de los permitidos)
        var password = request.Password;
        if (password.Length < 8)
            return new RegisterUserResultDto(false, "La contraseña debe tener un mínimo de 8 caracteres.", null);

        if (!password.Any(char.IsUpper))
            return new RegisterUserResultDto(false, "La contraseña debe contener al menos 1 letra en mayúscula.", null);

        if (!password.Any(char.IsLower))
            return new RegisterUserResultDto(false, "La contraseña debe contener al menos 1 letra en minúscula.", null);

        if (!password.Any(char.IsDigit))
            return new RegisterUserResultDto(false, "La contraseña debe contener al menos un número.", null);

        string specialChars = "!@#$%^&*()_+{}[]:;<>?,./~|-";
        if (!password.Any(c => specialChars.Contains(c)))
            return new RegisterUserResultDto(false, "La contraseña debe contener al menos 1 carácter especial (signo permitido).", null);

        // 4. Validación de Teléfono
        if (!string.IsNullOrWhiteSpace(request.Telefono))
        {
            if (!PhoneRegex.IsMatch(request.Telefono))
                return new RegisterUserResultDto(false, "El número de teléfono no tiene un formato válido (debe tener 10 dígitos o formato como 809-555-0199).", null);
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
            request.Telefono?.Trim(),
            request.Cedula?.Trim()
        );

        // 8. Guardar en Base de Datos
        await _usuarioRepository.AddAsync(user, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new RegisterUserResultDto(true, null, user.Id);
    }
}
