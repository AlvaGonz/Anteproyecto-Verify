namespace Application.Abstractions.Ocr;

using Domain.Enums;

public record OcrField
{
    public string Name { get; init; } = string.Empty;
    public string Value { get; init; } = string.Empty;
    public double Confidence { get; init; }
    public OcrFieldReviewState ReviewState { get; init; } = OcrFieldReviewState.Unreviewed;
    public string? CorrectedValue { get; init; }
}
