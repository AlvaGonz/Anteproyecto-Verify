namespace Application.DTOs.Validation;

using Domain.Enums;

public class AyuntamientoQueryResultDto
{
    public bool IsSuccess { get; set; }
    public AyuntamientoValidationResult Result { get; set; }
    public string? Detalle { get; set; }
    public bool DisponibilidadServicio { get; set; }
    public string? ErrorMessage { get; set; }
}
