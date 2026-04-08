namespace Application.DTOs.Integrations;

public class CatastroResponseDto
{
    public bool IsSuccess { get; set; }
    public string DesignacionCatastral { get; set; } = string.Empty;
    public string CoordenadasGps { get; set; } = string.Empty;
    public decimal AreaMetrosCuadrados { get; set; }
    public string Limites { get; set; } = string.Empty;
    public string? ErrorMessage { get; set; }
}
