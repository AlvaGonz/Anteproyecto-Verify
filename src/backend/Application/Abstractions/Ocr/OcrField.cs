namespace Application.Abstractions.Ocr;

public record OcrField
{
    public string Name { get; init; } = string.Empty;
    public string Value { get; init; } = string.Empty;
    public double Confidence { get; init; }
}
