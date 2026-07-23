namespace Application.Documents.Extractions;

using Application.Abstractions.Ocr;
using System.Collections.Generic;
using System.Linq;

public static class CertificadoTituloRdPaddleMapper
{
    public static CertificadoTituloRdExtractionV1? MapFromOcrResult(OcrResult ocrResult)
    {
        if (ocrResult == null) return null;

        var extraction = new CertificadoTituloRdExtractionV1
        {
            ExtractionStatus = ocrResult.Success ? ExtractionStatus.Completed : ExtractionStatus.Failed,
            OverallConfidence = ocrResult.Confidence
        };

        // Reconstruct full text from RawJson Python-like tuples
        string fullText = ocrResult.ExtractedText;
        if (!string.IsNullOrWhiteSpace(ocrResult.RawJson) && ocrResult.RawJson.Contains("('"))
        {
            var matches = System.Text.RegularExpressions.Regex.Matches(ocrResult.RawJson.Replace("\\\"", "\""), @"\('(.*?)',\s*(\d+\.\d+)");
            var lines = new List<string>();
            foreach (System.Text.RegularExpressions.Match m in matches)
            {
                lines.Add(m.Groups[1].Value);
            }
            if (lines.Any())
            {
                fullText = string.Join(" ", lines);
            }
        }

        extraction = extraction with 
        {
            Oficina = MapFieldRegex(fullText, @"(Registro\s*de\s*T[ií]tulos\s*(?:de|del)?\s*[\wñÑ\s]{1,30}?)(?:\s*\d|\s*$|\s*Zunda|\s*DESIGNACI[OÓ]N|\s*CERTIFICACION|\s*MATR[IÍ]CULA)", @"(REGISTRO\s+DE\s+T[ií]TULOS\s+(?:DE\s+)?[a-zA-ZñÑ\s]+)"),
            DesignacionCatastral = MapFieldRegex(fullText, @"(?:DESIGNACI[OÓ]N\s+CATASTRAL\s*(?:S\s*)?)([\d\-]+)", @"(?:Parce[l]?a\s*(?:dl\s*DoCra\s*Ha\.|del\s*Distrito\s*Catastral\s*No\.)?\s*)([\d\.]+(?:\s+\d+)?)", @"(?:Parce[l]?a\s+)([\d\.]+(?:\s+\d+)?)"),
            FechaYHoraInscripcion = MapFieldRegex(fullText, @"(?:Inscrito a las.*?el\s*)(\d{1,2}/[a-zA-Z]+/\d{4})", @"(?:FECHA Y HORA DE INSCRIPCION.*?)(?:\d{1,2}/\d{1,2}/\d{4})", @"(?:Em[a-zA-Z]*do\s*el|Emitido\s*el)\s*(\d{1,2}\s*de\s*[a-zA-Z]+\s*del\s*\d{4})", @"(?:Em[a-zA-Z]*do\s*el\s*)([0-9]{1,2}\s*de[a-zA-Z\s]+del\s*[0-9]{4})", @"(?:fecha\s*)([0-9]{1,2}\s*de[a-zA-Z\s]+del\s*[0-9]{4})"),
            VieneDe = MapFieldRegex(fullText, @"(?:cancela la anterior|viene de)\s*(?!JURISDICCION\b|MUNICIPIO\b|PROVINCIA\b)([\w\.\-]{2,30})"),
            Matricula = MapFieldRegex(fullText, @"(?:MATR[IÍ]CULA(?:\s*No\.?)?|MATR[IÍ]CULA|MATRICULA)\s*([\d-]+)"),
            Municipio = MapFieldRegex(fullText, @"MUNICIPIO\s*(?:PODER\s*JUDICIAL\s*:\s*REPUBLICA\s*DOMINICANA\s*)?([a-zA-Z\s]+?)(?=\s*PROVINCIA|\s*OFICINA|\s*SUPERFICIE|$)", @"(?:ubicado en)\s*([a-zA-Z\s]+?)(?:,)", @"(Santo Domingo de Guzm[aá]n|Santo Domingo|Bonao|SANTODOMINGODEOUMAN|SANTO DOMINGO DE GUZMAN)"),
            Provincia = MapFieldRegex(fullText, @"PROVINCIA\s*([a-zA-Z\s]+?)(?=\s*OFICINA|\s*SUPERFICIE|$)", @"PROVINCIA\s*(?:OFICINA\s*)?([a-zA-Z]+)", @"(SANTO DOMINGO|SANTIAGO|LA VEGA|BONAO|PUERTO PLATA|LAALTAGRACIA|LA ALTAGRACIA)"),
            SuperficieM2 = MapFieldRegex(fullText, @"(?:SUPERFICIE\s*EN\s*METROS\s*CUADRADOS|SUPERFICIE\s*M2|SUPERFICIE|SUPERFICIE)\s*([\d]+(?:[,.\s\']\d+)*)", @"([\d]+(?:[,.\s\']\d+)*)\s*(?:m2|m²|m\b|mtros\.cuadrados|metros cuadrados|MTS2)")
        };

        // Clean up trailing dots
        if (extraction.DesignacionCatastral.Status == FieldStatus.Valid && extraction.DesignacionCatastral.RawValue.EndsWith("."))
        {
            extraction = extraction with 
            {
                DesignacionCatastral = extraction.DesignacionCatastral with 
                {
                    RawValue = extraction.DesignacionCatastral.RawValue.TrimEnd('.'),
                    NormalizedValue = extraction.DesignacionCatastral.RawValue.TrimEnd('.')
                }
            };
        }

        var warnings = new List<string>();

        // Optional Viene De policy: missing does not cause failure, just a warning
        if (extraction.VieneDe.Status == FieldStatus.Missing)
        {
            warnings.Add("VieneDe is missing, but it is an optional field.");
        }

        // Allow partial extractions. If a field is missing, it will have FieldStatus.Missing.
        // We will only mark the overall status as Incomplete if the document appears to have failed completely 
        // to find basic anchors. For now, we trust the confidence/status of the OCR result.
        
        if (extraction.DesignacionCatastral.Status == FieldStatus.Missing &&
            extraction.Matricula.Status == FieldStatus.Missing &&
            extraction.SuperficieM2.Status == FieldStatus.Missing)
        {
            extraction = extraction with { ExtractionStatus = ExtractionStatus.Incomplete };
        }

        if (warnings.Any())
        {
            extraction = extraction with { Warnings = warnings };
        }

        return extraction;
    }

    private static ExtractedField MapFieldRegex(string fullText, params string[] patterns)
    {
        foreach (var p in patterns)
        {
            var match = System.Text.RegularExpressions.Regex.Match(fullText, p, System.Text.RegularExpressions.RegexOptions.IgnoreCase);
            if (match.Success)
            {
                var value = match.Groups.Count > 1 ? match.Groups[1].Value.Trim() : match.Value.Trim();
                if (!string.IsNullOrWhiteSpace(value))
                {
                    return new ExtractedField
                    {
                        RawValue = value,
                        NormalizedValue = value, // Normalization happens via DocumentFieldNormalizer later if needed
                        Confidence = 0.7, // Heuristic confidence
                        Status = FieldStatus.Valid,
                        SourcePage = 1
                    };
                }
            }
        }
        return new ExtractedField { Status = FieldStatus.Missing };
    }
}
