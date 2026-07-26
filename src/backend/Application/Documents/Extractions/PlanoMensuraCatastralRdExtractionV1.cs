using System.Collections.Generic;

namespace Application.Documents.Extractions
{
    public record PlanoMensuraCatastralRdExtractionV1
    {
        public string SchemaVersion { get; init; } = "1.0";
        public string DocumentType { get; init; } = "PlanoMensuraCatastral";
        public ExtractionStatus ExtractionStatus { get; init; }
        public double OverallConfidence { get; init; }
        public List<string> Warnings { get; init; } = new();
        public string ProcessorName { get; init; } = "PaddleOCR";
        public string ProcessorVersion { get; init; } = "1.0";

        public ExtractedField JurisdiccionInmobiliaria { get; init; } = new();
        public ExtractedField DireccionRegionalMensurasCatastrales { get; init; } = new();
        public ExtractedField Departamento { get; init; } = new();
        public ExtractedField Operacion { get; init; } = new();
        public ExtractedField DesignacionCatastralPosicional { get; init; } = new();
        public ExtractedField DesignacionCatastralOrigen { get; init; } = new();
        public ExtractedField Provincia { get; init; } = new();
        public ExtractedField Municipio { get; init; } = new();
        public ExtractedField Seccion { get; init; } = new();
        public ExtractedField Lugar { get; init; } = new();
        public ExtractedField SuperficieARegistrarParcelaM2 { get; init; } = new();
    }
}
