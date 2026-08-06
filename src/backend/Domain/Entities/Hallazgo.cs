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

    public Guid? DatoValidadoId { get; private set; }
    public DatoValidado? DatoValidado { get; private set; }

    public FindingSeverity Severidad { get; private set; }
    public string Codigo { get; private set; } = null!;
    public string Titulo { get; private set; } = null!;
    public string Descripcion { get; private set; } = null!;
    public string? Recomendacion { get; private set; }
    public string? SistemaOrigen { get; private set; }
    public string? Campo { get; private set; }
    public bool Resuelto { get; private set; }
    
    // Aliases for backward compatibility
    public FindingSeverity Severity => Severidad;
    public string Tipo => Titulo;
    public string? FuenteValidacion => SistemaOrigen;
    public DateTime FechaDeteccionUtc => CreatedAtUtc;

    private Hallazgo() { } // For EF Core

    public Hallazgo(Guid proyectoId, Guid? validacionId, string titulo, string descripcion, FindingSeverity severidad, string? recomendacion = null, string? sistemaOrigen = null)
    {
        if (proyectoId == Guid.Empty) throw new ArgumentException("Proyecto requerido", nameof(proyectoId));
        if (string.IsNullOrWhiteSpace(titulo)) throw new ArgumentException("Título requerido", nameof(titulo));
        if (string.IsNullOrWhiteSpace(descripcion)) throw new ArgumentException("Descripción requerida", nameof(descripcion));

        ProyectoId = proyectoId;
        ValidacionId = validacionId;
        Titulo = titulo;
        Descripcion = descripcion;
        Severidad = severidad;
        Recomendacion = recomendacion;
        SistemaOrigen = sistemaOrigen ?? "Sistema Interno";
        Codigo = GenerateCode(titulo);
        Resuelto = false;
    }

    public Hallazgo(Guid proyectoId, Guid datoValidadoId, string campo, string descripcion, FindingSeverity severidad)
    {
        if (proyectoId == Guid.Empty) throw new ArgumentException("Proyecto requerido", nameof(proyectoId));
        if (datoValidadoId == Guid.Empty) throw new ArgumentException("DatoValidado requerido", nameof(datoValidadoId));
        if (string.IsNullOrWhiteSpace(campo)) throw new ArgumentException("Campo requerido", nameof(campo));
        if (string.IsNullOrWhiteSpace(descripcion)) throw new ArgumentException("Descripción requerida", nameof(descripcion));

        ProyectoId = proyectoId;
        DatoValidadoId = datoValidadoId;
        Campo = campo;
        Titulo = $"Discrepancia en {campo}";
        Descripcion = descripcion;
        Severidad = severidad;
        SistemaOrigen = "API Validación";
        Codigo = GenerateCode(Titulo);
        Resuelto = false;
    }

    // Constructor compatible with legacy calls
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
        SistemaOrigen = "Sistema Interno";
        Resuelto = false;
    }

    public void MarkAsResolved()
    {
        Resuelto = true;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void MarkAsUnresolved()
    {
        Resuelto = false;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    private string GenerateCode(string prefix)
    {
        var cleanPrefix = prefix.Replace(" ", "").Substring(0, Math.Min(prefix.Length, 4)).ToUpper();
        return $"{cleanPrefix}-{Guid.NewGuid().ToString().Substring(0, 6).ToUpper()}";
    }
}
