namespace Application.DTOs.Audit;

using System;

public record AuditDto(
    Guid Id,
    Guid? ProyectoId,
    Guid? UsuarioId,
    string TipoEvento,
    string Accion,
    string? Entidad,
    string? EntidadId,
    string? Detalle,
    string? IpOrigen,
    string? UserAgent,
    DateTime FechaEventoUtc,
    string? Codigo = null
);
