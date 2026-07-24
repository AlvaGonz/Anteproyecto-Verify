namespace Application.Documents.Extractions;

using Application.Abstractions.Ocr;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;

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

        var lines = ExtractLines(ocrResult);
        string fullText = string.Join(" ", lines);

        extraction = extraction with 
        {
            Oficina = ExtractField(lines, fullText, "Oficina", 
                new[] { @"REGISTRO\s+DE\s+T[IÍ]TULOS", @"OFICINA\s+DE\s+REGISTRO" }, 
                new[] { @"(Registro\s*de\s*T[ií]tulos\s*(?:de|del)?\s*[\wñÑ\s]{1,30}?)(?:\s*\d|\s*$|\s*Zunda|\s*DESIGNACI[OÓ]N|\s*CERTIFICACION|\s*MATR[IÍ]CULA)", @"(REGISTRO\s+DE\s+T[ií]TULOS\s+(?:DE\s+)?[a-zA-ZñÑ\s]+)" }),
            
            DesignacionCatastral = ExtractField(lines, fullText, "DesignacionCatastral", 
                new[] { @"DESIGNACI[OÓ]N\s+CATASTRAL", @"PARCELA", @"SOLAR" }, 
                new[] { @"(?:DESIGNACI[OÓ]N\s+CATASTRAL\s*(?:S\s*)?)([\d\-]+)", @"(?:Parce[l]?a\s*(?:dl\s*DoCra\s*Ha\.|del\s*Distrito\s*Catastral\s*No\.)?\s*)([\d\.]+(?:\s+\d+)?)", @"(?:Parce[l]?a\s+)([\d\.]+(?:\s+\d+)?)" }),
            
            FechaYHoraInscripcion = ExtractField(lines, fullText, "Fecha", 
                new[] { @"FECHA\s+Y\s+HORA", @"INSCRITO\s+A\s+LAS" }, 
                new[] { @"(?:Inscrito a las.*?el\s*)(\d{1,2}/[a-zA-Z]+/\d{4})", @"(?:FECHA Y HORA DE INSCRIPCION.*?)(?:\d{1,2}/\d{1,2}/\d{4})", @"(?:Em[a-zA-Z]*do\s*el|Emitido\s*el)\s*(\d{1,2}\s*de\s*[a-zA-Z]+\s*del\s*\d{4})", @"(?:fecha\s*)([0-9]{1,2}\s*de[a-zA-Z\s]+del\s*[0-9]{4})" }),
            
            VieneDe = ExtractField(lines, fullText, "VieneDe", 
                new[] { @"CANCELA\s+LA\s+ANTERIOR", @"VIENE\s+DE" }, 
                new[] { @"(?:cancela la anterior|viene de)\s*(?!JURISDICCION\b|MUNICIPIO\b|PROVINCIA\b)([\w\.\-]{2,30})" }),
            
            Matricula = ExtractField(lines, fullText, "Matricula", 
                new[] { @"MATR[IÍ]CULA" }, 
                new[] { @"(?:MATR[IÍ]CULA(?:\s*No\.?)?|MATR[IÍ]CULA|MATRICULA)\s*([\d-]+)" }),
            
            Municipio = ExtractField(lines, fullText, "Municipio", 
                new[] { @"MUNICIPIO" }, 
                new[] { @"MUNICIPIO\s*(?:PODER\s*JUDICIAL\s*:\s*REPUBLICA\s*DOMINICANA\s*)?([a-zA-Z\s]+?)(?=\s*PROVINCIA|\s*OFICINA|\s*SUPERFICIE|$)", @"(?:ubicado en)\s*([a-zA-Z\s]+?)(?:,)", @"(Santo Domingo de Guzm[aá]n|Santo Domingo|Bonao)" }),
            
            Provincia = ExtractField(lines, fullText, "Provincia", 
                new[] { @"PROVINCIA" }, 
                new[] { @"PROVINCIA\s*([a-zA-Z\s]+?)(?=\s*OFICINA|\s*SUPERFICIE|$)", @"PROVINCIA\s*(?:OFICINA\s*)?([a-zA-Z]+)" }),
            
            SuperficieM2 = ExtractField(lines, fullText, "SuperficieM2", 
                new[] { @"SUPERFICIE" }, 
                new[] { @"(?:SUPERFICIE\s*EN\s*METROS\s*CUADRADOS|SUPERFICIE\s*M2|SUPERFICIE|SUPERFICIE)\s*([\d]+(?:[,.\s\']\d+)*)", @"([\d]+(?:[,.\s\']\d+)*)\s*(?:m2|m²|m\b|mtros\.cuadrados|metros cuadrados|MTS2)" })
        };

        // Extraction Status Classification
        var warnings = new List<string>();

        if (extraction.DesignacionCatastral.Status == FieldStatus.Missing || extraction.Matricula.Status == FieldStatus.Missing)
        {
            extraction = extraction with { ExtractionStatus = ExtractionStatus.Incomplete };
            warnings.Add("Required field Matricula or DesignacionCatastral is missing.");
        }

        if (extraction.SuperficieM2.Status == FieldStatus.Missing) warnings.Add("SuperficieM2 is missing.");
        if (extraction.FechaYHoraInscripcion.Status == FieldStatus.Missing) warnings.Add("Fecha is missing.");
        if (extraction.VieneDe.Status == FieldStatus.Missing) warnings.Add("VieneDe is missing.");
        if (extraction.Oficina.Status == FieldStatus.Missing) warnings.Add("Oficina is missing.");

        if (warnings.Any())
        {
            extraction = extraction with { Warnings = warnings };
        }

        return extraction;
    }

    private static List<string> ExtractLines(OcrResult ocrResult)
    {
        var lines = new List<string>();
        if (!string.IsNullOrWhiteSpace(ocrResult.RawJson) && ocrResult.RawJson.Contains("('"))
        {
            var matches = Regex.Matches(ocrResult.RawJson.Replace("\\\"", "\""), @"\('(.*?)',\s*(\d+\.\d+)");
            foreach (Match m in matches)
            {
                lines.Add(m.Groups[1].Value);
            }
        }
        else if (ocrResult.Lines != null && ocrResult.Lines.Any())
        {
            lines.AddRange(ocrResult.Lines.Select(l => l.Text));
        }
        else
        {
            lines.AddRange(ocrResult.ExtractedText.Split(new[] { '\n', '\r' }, System.StringSplitOptions.RemoveEmptyEntries));
        }
        return lines;
    }

    private static ExtractedField ExtractField(List<string> lines, string fullText, string fieldType, string[] labelPatterns, string[] regexPatterns)
    {
        string? rawValue = null;

        // Layer 1 & 2: Labeled field extraction + proximity
        for (int i = 0; i < lines.Count; i++)
        {
            var line = lines[i];
            foreach (var labelPattern in labelPatterns)
            {
                if (Regex.IsMatch(line, labelPattern, RegexOptions.IgnoreCase))
                {
                    // Check if value is on the same line after the label
                    var inlineMatch = Regex.Match(line, $@"{labelPattern}\s*[:\-]?\s*(.+)", RegexOptions.IgnoreCase);
                    if (inlineMatch.Success && !string.IsNullOrWhiteSpace(inlineMatch.Groups[1].Value))
                    {
                        rawValue = inlineMatch.Groups[1].Value;
                        break;
                    }
                    
                    // Check next line for proximity block
                    if (i + 1 < lines.Count && !Regex.IsMatch(lines[i + 1], @"^[A-Z\s]+$")) // If next line is not another all-caps label
                    {
                        rawValue = lines[i + 1];
                        break;
                    }
                }
            }
            if (rawValue != null) break;
        }

        // Layer 3: Regex fallback
        if (string.IsNullOrWhiteSpace(rawValue))
        {
            foreach (var p in regexPatterns)
            {
                var match = Regex.Match(fullText, p, RegexOptions.IgnoreCase);
                if (match.Success)
                {
                    rawValue = match.Groups.Count > 1 ? match.Groups[1].Value : match.Value;
                    break;
                }
            }
        }

        // Layer 4: Canonical Normalization
        if (!string.IsNullOrWhiteSpace(rawValue))
        {
            rawValue = rawValue.Trim().TrimEnd('.');
            string normalizedValue = rawValue;
            
            // Apply SharedFieldNormalizer if needed based on fieldType
            switch (fieldType)
            {
                case "Matricula":
                    normalizedValue = SharedFieldNormalizer.NormalizeMatricula(rawValue);
                    break;
                case "DesignacionCatastral":
                    normalizedValue = SharedFieldNormalizer.NormalizeDesignacionCatastral(rawValue);
                    break;
                case "SuperficieM2":
                    normalizedValue = SharedFieldNormalizer.NormalizeSuperficie(rawValue);
                    break;
            }

            return new ExtractedField
            {
                RawValue = rawValue,
                NormalizedValue = normalizedValue,
                Confidence = 0.8,
                Status = FieldStatus.Valid,
                SourcePage = 1
            };
        }

        return new ExtractedField { Status = FieldStatus.Missing };
    }
}
