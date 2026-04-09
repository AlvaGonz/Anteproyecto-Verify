namespace Domain.Entities;

using System;
using Domain.Common;
using Domain.Enums;

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

    // RF-17 New Fields
    public TipoOperacion TipoOperacion { get; private set; }
    public string? Resultado { get; private set; }
    public Guid? ReferenciaExpedienteId { get; private set; }
    public DateTime FechaHoraUtc => FechaEventoUtc; // Alias for RF-17

    private Auditoria() { } // For EF Core

    // Old constructor for backward compatibility
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
        ReferenciaExpedienteId = proyectoId;
        TipoEvento = tipoEvento;
        Accion = accion;
        Entidad = entidad;
        EntidadId = entidadId;
        Detalle = detalle;
        IpOrigen = ipOrigen;
        UserAgent = userAgent;
        FechaEventoUtc = DateTime.UtcNow;
        TipoOperacion = TipoOperacion.General;
        Resultado = detalle;
    }

    // Constructor used in Seeder
    public Auditoria(
        Guid proyectoId,
        Guid? usuarioId,
        string tipoEvento,
        string accion,
        string entidad,
        string entidadId,
        string detalle,
        string ipOrigen,
        string userAgent)
    {
        ProyectoId = proyectoId;
        ReferenciaExpedienteId = proyectoId;
        UsuarioId = usuarioId;
        TipoEvento = tipoEvento;
        Accion = accion;
        Entidad = entidad;
        EntidadId = entidadId;
        Detalle = detalle;
        IpOrigen = ipOrigen;
        UserAgent = userAgent;
        FechaEventoUtc = DateTime.UtcNow;
        TipoOperacion = TipoOperacion.General;
        Resultado = detalle;
    }

    // New constructor for RF-17 IAuditLogger
    public Auditoria(
        Guid? usuarioId,
        TipoOperacion tipoOperacion,
        string accion,
        string resultado,
        Guid? referenciaExpedienteId,
        string? ipOrigen,
        string? userAgent)
    {
        if (string.IsNullOrWhiteSpace(accion)) throw new ArgumentException("Acción requerida", nameof(accion));

        UsuarioId = usuarioId;
        TipoOperacion = tipoOperacion;
        Accion = accion;
        Resultado = resultado;
        ReferenciaExpedienteId = referenciaExpedienteId;
        ProyectoId = referenciaExpedienteId;
        IpOrigen = ipOrigen;
        UserAgent = userAgent;
        FechaEventoUtc = DateTime.UtcNow;
        TipoEvento = tipoOperacion.ToString();
        Detalle = resultado;
    }
}
