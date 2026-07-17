namespace Application.Abstractions.Ocr;

using System.Collections.Generic;

public record OcrResult
{
    public bool Success { get; init; }
    public string ExtractedText { get; init; } = string.Empty;
    public Dictionary<string, string> Entities { get; init; } = new();
    public string RawJson { get; init; } = string.Empty;
    public string ErrorMessage { get; init; } = string.Empty;
}
