namespace Infrastructure.ExternalServices.Catastro;

public class CatastroGeoOptions
{
    public const string SectionName = "CatastroGeo";
    public string BaseUrl { get; set; } = string.Empty;
    public string ApiKey { get; set; } = string.Empty;
    public int TimeoutSeconds { get; set; } = 30;
}
