namespace Application.DTOs.Notifications;

using System;

public record NotificationDto(
    Guid Id,
    string CodigoReferencia,
    string Mensaje,
    string Tipo,
    bool Leida,
    DateTime FechaUtc,
    string? EnlaceRelacionado,
    string? Email,
    string? Telefono
);
