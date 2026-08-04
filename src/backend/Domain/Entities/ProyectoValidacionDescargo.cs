namespace Domain.Entities;

using System;
using Domain.Common;

public class ProyectoValidacionDescargo : EntityBase
{
    public Guid UsuarioId { get; private set; }
    public Usuario Usuario { get; private set; } = null!;

    public Guid ProyectoId { get; private set; }
    public Proyecto Proyecto { get; private set; } = null!;

    protected ProyectoValidacionDescargo() { } // For EF Core

    public ProyectoValidacionDescargo(Guid usuarioId, Guid proyectoId)
    {
        UsuarioId = usuarioId;
        ProyectoId = proyectoId;
        CreatedAtUtc = DateTime.UtcNow;
    }
}
