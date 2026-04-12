namespace Domain.Entities;

using System;
using Domain.Common;

public class Notificacion : EntityBase
{
    public Guid UsuarioId { get; private set; }
    public string Mensaje { get; private set; } = null!;
    public string Tipo { get; private set; } = null!; // Info, Warning, Success, Error
    public bool Leida { get; private set; }
    public DateTime FechaUtc { get; private set; }
    public string? EnlaceRelacionado { get; private set; }

    private Notificacion() { } // For EF Core

    public Notificacion(Guid usuarioId, string mensaje, string tipo = "Info", string? enlaceRelacionado = null)
    {
        if (usuarioId == Guid.Empty) throw new ArgumentException("Usuario requerido", nameof(usuarioId));
        if (string.IsNullOrWhiteSpace(mensaje)) throw new ArgumentException("Mensaje requerido", nameof(mensaje));

        UsuarioId = usuarioId;
        Mensaje = mensaje;
        Tipo = tipo;
        EnlaceRelacionado = enlaceRelacionado;
        Leida = false;
        FechaUtc = DateTime.UtcNow;
    }

    public void MarcarComoLeida()
    {
        Leida = true;
    }

    public void MarkAsRead() => MarcarComoLeida();
}
