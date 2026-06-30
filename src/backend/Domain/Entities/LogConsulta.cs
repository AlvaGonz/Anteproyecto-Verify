namespace Domain.Entities;

using System;
using Domain.Common;

public class LogConsulta : EntityBase
{
    public Guid UsuarioId { get; private set; }
    public Usuario Usuario { get; private set; } = null!;
    
    public DateTime FechaConsulta { get; private set; }
    public bool Exitoso { get; private set; }
    public string? Detalle { get; private set; }

    private LogConsulta() { } // For EF Core

    public LogConsulta(Guid usuarioId, bool exitoso, string? detalle = null)
    {
        UsuarioId = usuarioId;
        FechaConsulta = DateTime.UtcNow;
        Exitoso = exitoso;
        Detalle = detalle;
    }
}
