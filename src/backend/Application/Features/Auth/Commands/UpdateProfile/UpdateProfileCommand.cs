using System;

namespace Application.Features.Auth.Commands.UpdateProfile;

public record UpdateProfileCommand(
    Guid UserId,
    string? Nombre,
    string? Apellido,
    string? Telefono,
    string? Cedula,
    string? Rnc,
    string? RazonSocial,
    string? NombreComercial,
    string? ActividadEconomica,
    string? Direccion,
    string? Provincia,
    string? Nickname,
    string? NewPassword
);
