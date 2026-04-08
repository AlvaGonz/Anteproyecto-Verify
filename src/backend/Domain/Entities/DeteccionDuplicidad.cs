namespace Domain.Entities;

using System;
using Domain.Common;
using Domain.Enums;

public class DeteccionDuplicidad : EntityBase
{
    public Guid ProyectoId { get; private set; }
    public Proyecto Proyecto { get; private set; } = null!;

    public Guid? ProyectoDuplicadoId { get; private set; }
    public Proyecto? ProyectoDuplicado { get; private set; }

    public DuplicityRiskLevel NivelRiesgo { get; private set; }
    public string DescripcionCoincidencia { get; private set; } = string.Empty;
    public DateTime FechaDeteccion { get; private set; }
    public bool Bloqueante { get; private set; }

    private DeteccionDuplicidad() { } // For EF Core

    public DeteccionDuplicidad(Guid proyectoId, DuplicityRiskLevel nivelRiesgo, string descripcionCoincidencia, bool bloqueante, Guid? proyectoDuplicadoId = null)
    {
        if (proyectoId == Guid.Empty) throw new ArgumentException("Proyecto requerido", nameof(proyectoId));
        if (string.IsNullOrWhiteSpace(descripcionCoincidencia)) throw new ArgumentException("Descripción requerida", nameof(descripcionCoincidencia));

        ProyectoId = proyectoId;
        NivelRiesgo = nivelRiesgo;
        DescripcionCoincidencia = descripcionCoincidencia;
        Bloqueante = bloqueante;
        ProyectoDuplicadoId = proyectoDuplicadoId;
        FechaDeteccion = DateTime.UtcNow;
    }
}
