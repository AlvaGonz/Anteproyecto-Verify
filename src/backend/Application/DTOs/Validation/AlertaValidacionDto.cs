namespace Application.DTOs.Validation;

using System;
using Domain.Enums;

public class AlertaValidacionDto
{
    public Guid Id { get; set; }
    public Guid ProyectoId { get; set; }
    public Guid? DocumentoId { get; set; }
    public AlertType Type { get; set; }
    public AlertCategory Category { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public string? Recomendacion { get; set; }
    public bool Resuelta { get; set; }
    public DateTime FechaGeneracion { get; set; }
    public string NivelRiesgo { get; set; } = string.Empty;
}
