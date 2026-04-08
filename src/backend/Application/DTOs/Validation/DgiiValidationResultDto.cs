namespace Application.DTOs.Validation;

using Domain.Enums;

public class DgiiValidationResultDto
{
    public bool IsSuccess { get; set; }
    public string Rnc { get; set; } = string.Empty;
    public string RazonSocial { get; set; } = string.Empty;
    public DgiiStatus Status { get; set; }
    public bool TieneDeudas { get; set; }
    public string? ErrorMessage { get; set; }
}
