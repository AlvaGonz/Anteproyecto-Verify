namespace Domain.Entities;

using System;
using Domain.Common;

public class LogProyecto : EntityBase
{
    public Guid UsuarioId { get; private set; }
    public Usuario Usuario { get; private set; } = null!;
    
    public Guid ProyectoId { get; private set; }
    public Proyecto Proyecto { get; private set; } = null!;

    public DateTime FechaCreacion { get; private set; }
    public string? Detalle { get; private set; }

    private LogProyecto() { } // For EF Core

    public LogProyecto(Guid usuarioId, Guid proyectoId, string? detalle = null)
    {
        UsuarioId = usuarioId;
        ProyectoId = proyectoId;
        FechaCreacion = DateTime.UtcNow;
        Detalle = detalle;
    }
}
