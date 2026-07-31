namespace Api.Common;

public sealed class ErrorEnvelope
{
    public bool Succeeded { get; set; }
    public string Code { get; set; } = "UNKNOWN";
    public string Message { get; set; } = string.Empty;
    public string CorrelationId { get; set; } = string.Empty;
    public bool LockedOut { get; set; }
}
