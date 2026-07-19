namespace Application.Abstractions.Ocr;

using System;
using System.Collections.Generic;

public record OcrResult
{
    public bool Success { get; init; }
    public string RawText { get; init; } = string.Empty;
    public string ExtractedText { get; init; } = string.Empty;
    public double Confidence { get; init; }
    public string Provider { get; init; } = string.Empty;
    public string SourceFile { get; init; } = string.Empty;
    public IReadOnlyList<OcrLine> Lines { get; init; } = Array.Empty<OcrLine>();
    public Dictionary<string, OcrField> Fields { get; init; } = new Dictionary<string, OcrField>();
    
    // Legacy support for older code until refactored
    public Dictionary<string, string> Entities { get; init; } = new();
    public string RawJson { get; init; } = string.Empty;
    public string ErrorMessage { get; init; } = string.Empty;
}
