namespace Application.Documents.Extractions;

using System.Collections.Generic;

public record CertificadoTituloRdExtractionV1
{
    public string SchemaVersion { get; init; } = "1.0";
    public string DocumentType { get; init; } = "CertificadoTitulo";
    public ExtractionStatus ExtractionStatus { get; init; }
    public double OverallConfidence { get; init; }
    public ExtractedField Oficina { get; init; } = new();
    public ExtractedField DesignacionCatastral { get; init; } = new();
    public ExtractedField FechaYHoraInscripcion { get; init; } = new();
    public ExtractedField VieneDe { get; init; } = new();
    public ExtractedField Matricula { get; init; } = new();
    public ExtractedField Municipio { get; init; } = new();
    public ExtractedField Provincia { get; init; } = new();
    public ExtractedField SuperficieM2 { get; init; } = new();
    public List<string> Warnings { get; init; } = new();
    public string ProcessorName { get; init; } = "PaddleOCR";
    public string ProcessorVersion { get; init; } = "1.0";

    /// <summary>
    /// Canonical resolution result for the Provincia field.
    /// Populated by GeoResolutionService in DocumentService after OCR extraction.
    /// Null when resolution has not yet been performed.
    /// </summary>
    public GeographicResolutionResult? ProvinceResolution { get; init; }

    /// <summary>
    /// Canonical resolution result for the Municipio field, scoped to resolved province.
    /// Null when resolution has not yet been performed or province is unresolved.
    /// </summary>
    public GeographicResolutionResult? MunicipalityResolution { get; init; }
}

