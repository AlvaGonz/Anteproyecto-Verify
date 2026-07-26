namespace Application.Documents.Extractions;

using System.Collections.Generic;

public record CertificacionIPIRdExtractionV1
{
    public string SchemaVersion { get; init; } = "1.0";
    public string DocumentType { get; init; } = "CertificacionIPI";
    public ExtractionStatus ExtractionStatus { get; init; }
    public double OverallConfidence { get; init; }
    
    public ExtractedField NumeroCertificacion { get; init; } = new();
    public ExtractedField NumeroInmueble { get; init; } = new();
    public ExtractedField ParcelaNumero { get; init; } = new();
    
    public List<string> Warnings { get; init; } = new();
    public string ProcessorName { get; init; } = "PaddleOCR";
    public string ProcessorVersion { get; init; } = "1.0";
}