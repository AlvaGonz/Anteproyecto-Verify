namespace Application.DTOs.Validation;

using System;
using Domain.Enums;

public class DocumentFormalEvaluationDto
{
    public Guid DocumentoId { get; set; }
    public DocumentFormalStatus FormalStatus { get; set; }
    public DateTime? FechaVencimiento { get; set; }
    public string? VersionReglaAplicada { get; set; }
    public DateTime FechaEvaluacion { get; set; }
}
