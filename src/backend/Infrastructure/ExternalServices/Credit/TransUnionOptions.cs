namespace Infrastructure.ExternalServices.Credit;

public class TransUnionOptions
{
    public const string SectionName = "TransUnion";
    public string BaseUrl { get; set; } = string.Empty;
    public string ApiKey { get; set; } = string.Empty;
    public string SubscriberId { get; set; } = string.Empty;
    public int TimeoutSeconds { get; set; } = 30;
}
