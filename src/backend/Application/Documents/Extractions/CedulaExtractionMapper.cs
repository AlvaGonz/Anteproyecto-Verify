namespace Application.Documents.Extractions;

using Application.Abstractions.Ocr;
using System.Text.Json;
using System.Linq;

public static class CedulaExtractionMapper
{
    public static CedulaRdExtractionV1? MapFromOcrResult(OcrResult ocrResult)
    {
        if (ocrResult == null) return null;

        var extraction = new CedulaRdExtractionV1
        {
            ExtractionStatus = ocrResult.Success ? ExtractionStatus.Completed : ExtractionStatus.Failed,
            OverallConfidence = ocrResult.Confidence
        };

        if (ocrResult.Fields != null)
        {
            extraction = extraction with 
            {
                CedulaNumber = MapField(ocrResult, "cedulaNumber"),
                FirstNames = MapField(ocrResult, "firstNames"),
                LastNames = MapField(ocrResult, "lastNames"),
                BirthDate = MapField(ocrResult, "birthDate"),
                ExpiryDate = MapField(ocrResult, "expiryDate")
            };

            // If required fields are missing, status is incomplete
            if (extraction.CedulaNumber.Status == FieldStatus.Missing ||
                extraction.FirstNames.Status == FieldStatus.Missing ||
                extraction.LastNames.Status == FieldStatus.Missing ||
                extraction.BirthDate.Status == FieldStatus.Missing ||
                extraction.ExpiryDate.Status == FieldStatus.Missing)
            {
                extraction = extraction with { ExtractionStatus = ExtractionStatus.Incomplete };
            }
        }

        return extraction;
    }

    private static ExtractedField MapField(OcrResult ocrResult, string fieldName)
    {
        if (ocrResult.Fields.TryGetValue(fieldName, out var field))
        {
            var status = string.IsNullOrEmpty(field.Value) ? FieldStatus.Missing : FieldStatus.Valid;
            
            return new ExtractedField
            {
                RawValue = field.Value,
                NormalizedValue = field.Value,
                Confidence = field.Confidence,
                Status = status,
                SourcePage = 1
            };
        }

        return new ExtractedField { Status = FieldStatus.Missing };
    }
}
