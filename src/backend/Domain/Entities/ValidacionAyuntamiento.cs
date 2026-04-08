namespace Domain.Entities;

using System;
using Domain.Common;
using Domain.Enums;

public class ValidacionAyuntamiento : EntityBase
{
    public Guid ProyectoId { get; private set; }
    public Proyecto Proyecto { get; private set; } = null!;

    public string Municipio { get; private set; } = string.Empty;
    public AyuntamientoValidationResult Result { get; private set; }
    public string? Detalle { get; private set; }
    public DateTime FechaConsulta { get; private set; }
    public bool DisponibilidadServicio { get; private set; }

    private ValidacionAyuntamiento() { } // For EF Core

    public ValidacionAyuntamiento(Guid proyectoId, string municipio, AyuntamientoValidationResult result, string? detalle, DateTime fechaConsulta, bool disponibilidadServicio)
    {
        if (proyectoId == Guid.Empty) throw new ArgumentException("Proyecto requerido", nameof(proyectoId));
        if (string.IsNullOrWhiteSpace(municipio)) throw new ArgumentException("Municipio requerido", nameof(municipio));

        ProyectoId = proyectoId;
        Municipio = municipio;
        Result = result;
        Detalle = detalle;
        FechaConsulta = fechaConsulta;
        DisponibilidadServicio = disponibilidadServicio;
    }
}
