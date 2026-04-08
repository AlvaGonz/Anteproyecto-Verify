namespace Domain.Entities;

using System;
using Domain.Common;
using Domain.Enums;

public class Hallazgo : EntityBase
{
    public Guid ProyectoId { get; private set; }
    public Proyecto Proyecto { get; private set; } = null!;

    public Guid? ValidacionId { get; private set; }
    public Validacion? Validacion { get; private set; }

    public FindingSeverity Severidad { get; private set; }
    public string Codigo { get; private set; }
    public string Titulo { get; private set; }
    public string Descripcion { get; private set; }
    public string? Recomendacion { get; private set; }
    public bool Resuelto { get; private set; }

    private Hallazgo() { } // For EF Core

    public Hallazgo(Guid proyectoId, FindingSeverity severidad, string codigo, string titulo, string descripcion, Guid? validacionId = null)
    {
        if (proyectoId == Guid.Empty) throw new ArgumentException("Proyecto requerido", nameof(proyectoId));
        if (string.IsNullOrWhiteSpace(codigo)) throw new ArgumentException("Código requerido", nameof(codigo));
        if (string.IsNullOrWhiteSpace(titulo)) throw new ArgumentException("Título requerido", nameof(titulo));
        if (string.IsNullOrWhiteSpace(descripcion)) throw new ArgumentException("Descripción requerida", nameof(descripcion));

        ProyectoId = proyectoId;
        ValidacionId = validacionId;
        Severidad = severidad;
        Codigo = codigo;
        Titulo = titulo;
        Descripcion = descripcion;
        Resuelto = false;
    }

    public void MarkAsResolved()
    {
        Resuelto = true;
        UpdatedAtUtc = DateTime.UtcNow;
    }
}
