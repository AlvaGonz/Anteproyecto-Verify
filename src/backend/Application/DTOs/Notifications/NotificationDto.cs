namespace Application.DTOs.Notifications;

using System;

public record NotificationDto(
    Guid Id,
    string Mensaje,
    string Tipo,
    bool Leida,
    DateTime FechaUtc,
    string? EnlaceRelacionado
);
