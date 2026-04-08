namespace Application.Features.Validation.Commands.GenerateAlerta;

using System;
using Domain.Enums;

public class GenerateAlertaCommand
{
    public Guid ProyectoId { get; set; }
    public Guid UsuarioId { get; set; }
    public Guid? DocumentoId { get; set; }
    public AlertType Type { get; set; }
    public AlertCategory Category { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public string NivelRiesgo { get; set; } = string.Empty;
    public string? Recomendacion { get; set; }
}
