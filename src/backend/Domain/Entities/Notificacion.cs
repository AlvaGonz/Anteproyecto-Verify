namespace Domain.Entities;

using System;
using Domain.Common;

public class Notificacion : EntityBase
{
    public Guid UsuarioId { get; private set; }
    public string Mensaje { get; private set; } = null!;
    public string Tipo { get; private set; } = null!;
    public int? TipoNotificacionId { get; private set; }
    public byte Prioridad { get; private set; } = 3;
    public bool Leida { get; private set; }
    public DateTime FechaUtc { get; private set; }
    public string? EnlaceRelacionado { get; private set; }
    public string CodigoReferencia { get; private set; } = null!;
    public Guid? EntidadReferenciaId { get; private set; }
    public string? EntidadReferenciaTipo { get; private set; }

    public TipoNotificacion? TipoNotificacion { get; private set; }
    public Usuario Usuario { get; private set; } = null!;
    public ICollection<NotificacionEntrega> Entregas { get; private set; } = new List<NotificacionEntrega>();

    private Notificacion() { }

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

        var randomString = new string(Enumerable.Repeat("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 5)
            .Select(s => s[new Random().Next(s.Length)]).ToArray());
        CodigoReferencia = $"{FechaUtc:yyyyMMddHHmmss}-{randomString}";
    }

    public Notificacion(
        Guid usuarioId,
        string mensaje,
        int tipoNotificacionId,
        string tipoCodigo,
        byte prioridad,
        string[] canales,
        string? enlaceRelacionado = null,
        Guid? entidadReferenciaId = null,
        string? entidadReferenciaTipo = null)
    {
        if (usuarioId == Guid.Empty) throw new ArgumentException("Usuario requerido", nameof(usuarioId));
        if (string.IsNullOrWhiteSpace(mensaje)) throw new ArgumentException("Mensaje requerido", nameof(mensaje));
        if (canales == null || canales.Length == 0) throw new ArgumentException("Al menos un canal requerido", nameof(canales));

        UsuarioId = usuarioId;
        Mensaje = mensaje;
        Tipo = tipoCodigo;
        TipoNotificacionId = tipoNotificacionId;
        Prioridad = prioridad;
        EnlaceRelacionado = enlaceRelacionado;
        EntidadReferenciaId = entidadReferenciaId;
        EntidadReferenciaTipo = entidadReferenciaTipo;
        Leida = false;
        FechaUtc = DateTime.UtcNow;

        var randomString = new string(Enumerable.Repeat("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 5)
            .Select(s => s[new Random().Next(s.Length)]).ToArray());
        CodigoReferencia = $"{FechaUtc:yyyyMMddHHmmss}-{randomString}";

        foreach (var canal in canales)
        {
            Entregas.Add(new NotificacionEntrega(Id, canal));
        }
    }

    public void MarcarComoLeida()
    {
        Leida = true;
    }

    public void MarkAsRead() => MarcarComoLeida();
}
