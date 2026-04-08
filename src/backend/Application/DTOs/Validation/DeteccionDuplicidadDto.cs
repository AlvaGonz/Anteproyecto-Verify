namespace Application.DTOs.Validation;

using System;
using Domain.Enums;

public class DeteccionDuplicidadDto
{
    public Guid Id { get; set; }
    public Guid ProyectoId { get; set; }
    public Guid? ProyectoDuplicadoId { get; set; }
    public DuplicityRiskLevel NivelRiesgo { get; set; }
    public string DescripcionCoincidencia { get; set; } = string.Empty;
    public DateTime FechaDeteccion { get; set; }
    public bool Bloqueante { get; set; }
}
