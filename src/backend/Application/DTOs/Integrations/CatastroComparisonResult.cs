namespace Application.DTOs.Integrations;

public class CatastroComparisonResult
{
    public bool HasDiscrepancies { get; set; }
    public string? AreaDiscrepancy { get; set; }
    public string? LocationDiscrepancy { get; set; }
    public string? LimitsDiscrepancy { get; set; }
}
