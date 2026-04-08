namespace Domain.Entities;

using System;
using Domain.Common;
using Domain.Enums;

public class ValidacionDgii : EntityBase
{
    public Guid ProyectoId { get; private set; }
    public Proyecto Proyecto { get; private set; } = null!;

    public string Rnc { get; private set; } = string.Empty;
    public DgiiStatus Status { get; private set; }
    public bool TieneDeudas { get; private set; }
    public DateTime FechaConsulta { get; private set; }
    public string? ErrorMessage { get; private set; }
    public string OrigenDatos { get; private set; } = string.Empty;

    private ValidacionDgii() { } // For EF Core

    public ValidacionDgii(Guid proyectoId, string rnc, DgiiStatus status, bool tieneDeudas, DateTime fechaConsulta, string? errorMessage, string origenDatos)
    {
        if (proyectoId == Guid.Empty) throw new ArgumentException("Proyecto requerido", nameof(proyectoId));
        if (string.IsNullOrWhiteSpace(rnc)) throw new ArgumentException("RNC requerido", nameof(rnc));

        ProyectoId = proyectoId;
        Rnc = rnc;
        Status = status;
        TieneDeudas = tieneDeudas;
        FechaConsulta = fechaConsulta;
        ErrorMessage = errorMessage;
        OrigenDatos = origenDatos;
    }
}
