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
    public string CodigoReferencia { get; private set; } = null!;

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

        // Generate CodigoReferencia: Date + Time + Random 5 Alphanumeric chars
        var randomString = new string(Enumerable.Repeat("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 5)
            .Select(s => s[new Random().Next(s.Length)]).ToArray());
        CodigoReferencia = $"{FechaUtc:yyyyMMddHHmmss}-{randomString}";
    }

    public void MarcarComoLeida()
    {
        Leida = true;
    }

    public void MarkAsRead() => MarcarComoLeida();
}
