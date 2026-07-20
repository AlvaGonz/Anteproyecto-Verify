using System;
using System.Text.Json;

public record OcrLine(string Text, double Confidence);
public record OcrField(string Name, string Value, double Confidence);

public record OcrResult
{
    public bool Success { get; init; }
    public string RawText { get; init; } = string.Empty;
    public string ExtractedText { get; init; } = string.Empty;
    public double Confidence { get; init; }
    public string Provider { get; init; } = string.Empty;
    public string SourceFile { get; init; } = string.Empty;
    public OcrLine[] Lines { get; init; } = Array.Empty<OcrLine>();
    public System.Collections.Generic.Dictionary<string, OcrField> Fields { get; init; } = new();
    public System.Collections.Generic.Dictionary<string, string> Entities { get; init; } = new();
    public string RawJson { get; init; } = string.Empty;
    public string ErrorMessage { get; init; } = string.Empty;
}

var res = new OcrResult { Success = false, ExtractedText = "", RawJson = "{\"error\": \"Connection refused (localhost:8000)\"}" };
var options = new JsonSerializerOptions { WriteIndented = false, PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
Console.WriteLine(JsonSerializer.Serialize(res, options));
