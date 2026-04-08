namespace Domain.Entities;

using System;
using Domain.Common;

public class Auditoria : EntityBase
{
    public Guid? UsuarioId { get; private set; }
    public Usuario? Usuario { get; private set; }

    public Guid? ProyectoId { get; private set; }
    public Proyecto? Proyecto { get; private set; }

    public string TipoEvento { get; private set; } = null!;
    public string Accion { get; private set; } = null!;
    public string? Entidad { get; private set; }
    public string? EntidadId { get; private set; }
    public string? Detalle { get; private set; }
    public string? IpOrigen { get; private set; }
    public string? UserAgent { get; private set; }
    public DateTime FechaEventoUtc { get; private set; }

    private Auditoria() { } // For EF Core

    public Auditoria(
        Guid? usuarioId, 
        string accion, 
        string tipoEvento = "General",
        string? entidad = null, 
        string? entidadId = null, 
        Guid? proyectoId = null, 
        string? detalle = null, 
        string? ipOrigen = null,
        string? userAgent = null)
    {
        if (string.IsNullOrWhiteSpace(accion)) throw new ArgumentException("Acción requerida", nameof(accion));

        UsuarioId = usuarioId;
        ProyectoId = proyectoId;
        TipoEvento = tipoEvento;
        Accion = accion;
        Entidad = entidad;
        EntidadId = entidadId;
        Detalle = detalle;
        IpOrigen = ipOrigen;
        UserAgent = userAgent;
        FechaEventoUtc = DateTime.UtcNow;
    }
}
