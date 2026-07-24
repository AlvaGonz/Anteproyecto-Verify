namespace Application.Documents.Extractions;

using System.Collections.Generic;

public record CedulaRdExtractionV1
{
    public string SchemaVersion { get; init; } = "1.0";
    public string DocumentType { get; init; } = "Cédula / Identidad del Titular";
    public ExtractionStatus ExtractionStatus { get; init; }
    public double OverallConfidence { get; init; }
    public ExtractedField CedulaNumber { get; init; } = new();
    public ExtractedField FirstNames { get; init; } = new();
    public ExtractedField LastNames { get; init; } = new();
    public ExtractedField BirthDate { get; init; } = new();
    public ExtractedField ExpiryDate { get; init; } = new();
    public List<string> Warnings { get; init; } = new();
    public string ProcessorName { get; init; } = "PaddleOCR";
    public string ProcessorVersion { get; init; } = "1.0";
}

public record ExtractedField
{
    public string RawValue { get; init; } = string.Empty;
    public string NormalizedValue { get; init; } = string.Empty;
    public double Confidence { get; init; }
    public FieldStatus Status { get; init; }
    public int SourcePage { get; init; }
}

public enum ExtractionStatus
{
    Queued,
    Processing,
    Completed,
    Incomplete,
    Failed
}

public enum FieldStatus
{
    Valid,
    Missing,
    Malformed,
    LowConfidence
}
