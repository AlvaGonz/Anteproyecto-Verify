namespace Domain.Entities;

using System;
using Domain.Common;
using Domain.Enums;

public class Reporte : EntityBase
{
    public Guid ProyectoId { get; private set; }
    public Proyecto Proyecto { get; private set; } = null!;

    public ReportStatus EstadoReporte { get; private set; }
    public string? Resumen { get; private set; }
    
    public Guid? GeneradoPorUsuarioId { get; private set; }
    public Usuario? GeneradoPorUsuario { get; private set; }

    public int Version { get; private set; }

    private Reporte() { } // For EF Core

    public Reporte(Guid proyectoId, Guid? generadoPorUsuarioId = null)
    {
        if (proyectoId == Guid.Empty) throw new ArgumentException("Proyecto requerido", nameof(proyectoId));

        ProyectoId = proyectoId;
        GeneradoPorUsuarioId = generadoPorUsuarioId;
        EstadoReporte = ReportStatus.Draft;
        Version = 1;
    }

    public void MarkAsGenerated(string resumen)
    {
        EstadoReporte = ReportStatus.Generated;
        Resumen = resumen;
        UpdatedAtUtc = DateTime.UtcNow;
    }
}
