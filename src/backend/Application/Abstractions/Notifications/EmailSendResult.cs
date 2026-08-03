namespace Application.Abstractions.Notifications;

public sealed record EmailSendResult
{
    public bool IsSuccess { get; init; }
    public string CorrelationId { get; init; } = string.Empty;
    public int? ResendStatusCode { get; init; }
    public string? ResendErrorBody { get; init; }
    public string? ErrorMessage { get; init; }

    public static EmailSendResult Success(string correlationId) => new()
    {
        IsSuccess = true,
        CorrelationId = correlationId
    };

    public static EmailSendResult Failure(string correlationId, int? statusCode, string? errorBody, string? errorMessage) => new()
    {
        IsSuccess = false,
        CorrelationId = correlationId,
        ResendStatusCode = statusCode,
        ResendErrorBody = errorBody,
        ErrorMessage = errorMessage
    };
}
