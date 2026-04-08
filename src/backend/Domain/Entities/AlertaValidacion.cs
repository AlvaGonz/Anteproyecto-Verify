namespace Domain.Entities;

using System;
using Domain.Common;
using Domain.Enums;

public class AlertaValidacion : EntityBase
{
    public Guid ProyectoId { get; private set; }
    public Proyecto Proyecto { get; private set; } = null!;

    public Guid? DocumentoId { get; private set; }
    public Documento? Documento { get; private set; }

    public AlertType Type { get; private set; }
    public AlertCategory Category { get; private set; }
    public string Titulo { get; private set; } = string.Empty;
    public string Descripcion { get; private set; } = string.Empty;
    public string? Recomendacion { get; private set; }
    public bool Resuelta { get; private set; }
    public DateTime FechaGeneracion { get; private set; }
    public string NivelRiesgo { get; private set; } = string.Empty;

    private AlertaValidacion() { } // For EF Core

    public AlertaValidacion(Guid proyectoId, AlertType type, AlertCategory category, string titulo, string descripcion, string nivelRiesgo, Guid? documentoId = null, string? recomendacion = null)
    {
        if (proyectoId == Guid.Empty) throw new ArgumentException("Proyecto requerido", nameof(proyectoId));
        if (string.IsNullOrWhiteSpace(titulo)) throw new ArgumentException("Título requerido", nameof(titulo));
        if (string.IsNullOrWhiteSpace(descripcion)) throw new ArgumentException("Descripción requerida", nameof(descripcion));

        ProyectoId = proyectoId;
        Type = type;
        Category = category;
        Titulo = titulo;
        Descripcion = descripcion;
        NivelRiesgo = nivelRiesgo;
        DocumentoId = documentoId;
        Recomendacion = recomendacion;
        Resuelta = false;
        FechaGeneracion = DateTime.UtcNow;
    }

    public void Resolve()
    {
        Resuelta = true;
        UpdatedAtUtc = DateTime.UtcNow;
    }
}
