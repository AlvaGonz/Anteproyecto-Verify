namespace Application.DTOs.Integrations;

public class DgriResponseDto
{
    public bool IsSuccess { get; set; }
    public string Vigencia { get; set; } = string.Empty;
    public string Titularidad { get; set; } = string.Empty;
    public bool TieneCargasJuridicas { get; set; }
    public string? Observaciones { get; set; }
    public string? ErrorMessage { get; set; }
}
