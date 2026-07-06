using System;

namespace Application.Features.Auth.Commands.UpdateProfile;

public record UpdateProfileCommand(
    Guid UserId,
    string? Nombre,
    string? Apellido,
    string? Telefono,
    string? Rnc,
    string? CurrentPassword,
    string? NewPassword
);
