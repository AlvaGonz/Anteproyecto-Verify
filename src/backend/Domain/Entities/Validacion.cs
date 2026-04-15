namespace Domain.Entities;

using System;
using System.Collections.Generic;
using Domain.Common;
using Domain.Enums;
using Domain.ValueObjects;

public class Validacion : EntityBase
{
    public Guid ProyectoId { get; private set; }
    public Proyecto Proyecto { get; private set; } = null!;

    public Guid? DocumentoId { get; private set; }
    public Documento? Documento { get; private set; }

    public string FuenteValidacion { get; private set; } = null!;
    public ValidationStatus EstadoValidacion { get; private set; }
    public ValidationStatus Estado => EstadoValidacion;
    public string TipoValidacion => FuenteValidacion;
    public bool? EsLegitimo { get; private set; }
    public double? PorcentajeIntegridad { get; private set; }
    public string? Detalle { get; private set; }
    public string? CamposValidadosJson { get; private set; }

    // Enterprise Fields (RF-11 to RF-15)
    private readonly List<DatoValidado> _datosValidados = new();
    public IReadOnlyCollection<DatoValidado> DatosValidados => _datosValidados.AsReadOnly();

    public SelloIntegridad? Sello { get; private set; }
    public Guid? SelloId { get; private set; }
    public string? SelloNombre => Sello?.Nombre;

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

    public Validacion(Guid proyectoId)
    {
        ProyectoId = proyectoId;
        FuenteValidacion = "Interna";
        EstadoValidacion = ValidationStatus.Pending;
    }

    public void CompleteValidation(bool esLegitimo, string? detalle, string? camposValidadosJson = null, double? porcentaje = null)
    {
        EstadoValidacion = ValidationStatus.Completed;
        EsLegitimo = esLegitimo;
        Detalle = detalle;
        CamposValidadosJson = camposValidadosJson;
        PorcentajeIntegridad = porcentaje;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void AddDatoValidado(DatoValidado dato)
    {
        _datosValidados.Add(dato);
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void AssignSello(SelloIntegridad sello)
    {
        Sello = sello;
        SelloId = sello.Id;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void UpdateIntegrityScore(double score)
    {
        PorcentajeIntegridad = score;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void UpdateStatus(ValidationStatus status, bool esLegitimo, int? totalHallazgos = 0, int? hallazgosCriticos = 0, int? hallazgosAltos = 0)
    {
        EstadoValidacion = status;
        EsLegitimo = esLegitimo;
        UpdatedAtUtc = DateTime.UtcNow;
    }
}
