namespace Application.Abstractions.Ocr;

public record OcrLine
{
    public string Text { get; init; } = string.Empty;
    public double Confidence { get; init; }
}
