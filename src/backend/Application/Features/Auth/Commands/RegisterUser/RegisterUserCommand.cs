namespace Application.Features.Auth.Commands.RegisterUser;

using System;

public record RegisterUserCommand(
    string Nombre,
    string Apellido,
    string Email,
    string Password,
    string? Telefono = null,
    string? Cedula = null
);

public record RegisterUserResultDto(
    bool IsSuccess,
    string? ErrorMessage,
    Guid? UsuarioId
);
