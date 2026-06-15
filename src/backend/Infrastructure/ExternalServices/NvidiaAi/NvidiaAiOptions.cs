namespace Infrastructure.ExternalServices.NvidiaAi;

public class NvidiaAiOptions
{
    public const string SectionName = "NvidiaAI";
    public string BaseUrl { get; set; } = "https://integrate.api.nvidia.com/v1";
    public string ApiKey { get; set; } = string.Empty;
    public string Model { get; set; } = "nvidia/nemotron-simple";
    public int TimeoutSeconds { get; set; } = 30;
}
