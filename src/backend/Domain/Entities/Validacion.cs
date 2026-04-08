namespace Domain.Entities;

using System;
using System.Collections.Generic;
using Domain.Common;
using Domain.Enums;

public class Validacion : EntityBase
{
    public Guid ProyectoId { get; private set; }
    public Proyecto Proyecto { get; private set; } = null!;

    public Guid? DocumentoId { get; private set; }
    public Documento? Documento { get; private set; }

    public string FuenteValidacion { get; private set; }
    public ValidationStatus EstadoValidacion { get; private set; }
    public bool? EsLegitimo { get; private set; }
    public string? Detalle { get; private set; }

    // Navigation properties
    public ICollection<Hallazgo> Hallazgos { get; private set; } = new List<Hallazgo>();
    public ICollection<ResultadoRegla> ResultadosRegla { get; private set; } = new List<ResultadoRegla>();

    private Validacion() { } // For EF Core

    public Validacion(Guid proyectoId, string fuenteValidacion, Guid? documentoId = null)
    {
        if (proyectoId == Guid.Empty) throw new ArgumentException("Proyecto requerido", nameof(proyectoId));
        if (string.IsNullOrWhiteSpace(fuenteValidacion)) throw new ArgumentException("Fuente requerida", nameof(fuenteValidacion));

        ProyectoId = proyectoId;
        DocumentoId = documentoId;
        FuenteValidacion = fuenteValidacion;
        EstadoValidacion = ValidationStatus.Pending;
    }

    public void CompleteValidation(bool esLegitimo, string? detalle)
    {
        EstadoValidacion = ValidationStatus.Completed;
        EsLegitimo = esLegitimo;
        Detalle = detalle;
        UpdatedAtUtc = DateTime.UtcNow;
    }
}
