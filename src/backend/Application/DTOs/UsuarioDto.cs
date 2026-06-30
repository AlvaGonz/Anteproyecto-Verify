namespace Application.DTOs;

using System;
using Domain.Enums;

public record UsuarioDto(
    Guid Id,
    string NombreCompleto,
    string CorreoElectronico,
    string? Telefono,
    string? Cedula,
    UserRole Rol,
    bool Activo,
    DateTime CreatedAtUtc,
    string? StripeCustomerId = null,
    string? StripeSubscriptionId = null,
    string? SubscriptionStatus = null,
    DateTime? CurrentPeriodEnd = null
);

public record CreateUsuarioDto(
    string NombreCompleto,
    string CorreoElectronico,
    string Contrasena,
    UserRole Rol
);
