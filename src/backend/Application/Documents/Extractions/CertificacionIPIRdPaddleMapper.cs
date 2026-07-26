namespace Application.Documents.Extractions;

using Application.Abstractions.Ocr;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;

public static class CertificacionIPIRdPaddleMapper
{
    public static CertificacionIPIRdExtractionV1? MapFromOcrResult(OcrResult ocrResult)
    {
        if (ocrResult == null) return null;

        var extraction = new CertificacionIPIRdExtractionV1
        {
            ExtractionStatus = ocrResult.Success ? ExtractionStatus.Completed : ExtractionStatus.Failed,
            OverallConfidence = ocrResult.Confidence
        };

        var lines = ExtractLines(ocrResult);
        string fullText = string.Join(" ", lines);

        extraction = extraction with
        {
            NumeroCertificacion = ExtractField(lines, fullText, "NumeroCertificacion",
                // Label patterns - more flexible for OCR variations
                new[] { 
                    @"NO\.?\s*DE\s*CERTIFICACI[OÓ]N", 
                    @"N[ÚU]MERO\s*DE\s*CERTIFICACI[OÓ]N", 
                    @"CERTIFICACI[OÓ]N\s*N[ÚU]MERO",
                    @"CERTIFICACION\s*NO\.?",
                    @"CERT\.?\s*NO\.?",
                    @"NO\.?\s*CERTIFICACION",
                    @"NUMERO\s*CERTIFICACION"
                },
                // Regex patterns - capture alphanumeric with hyphens
                new[] { 
                    @"(?:NO\.\s*DE\s*CERTIFICACI[OÓ]N|N[ÚU]MERO\s*DE\s*CERTIFICACI[OÓ]N|CERTIFICACI[OÓ]N\s*N[ÚU]MERO|CERTIFICACION\s*NO|NO\s*CERTIFICACION|NUMERO\s*CERTIFICACION)\s*[:\-]?\s*([A-Z0-9\-\/]+)",
                    @"(?:CERTIFICACI[OÓ]N\s*)([A-Z0-9\-\/]{6,})",
                    @"(?:NO\s*DE\s*CERTIFICACION\s*)([A-Z0-9\-\/]{6,})",
                    @"\b([Cc]\d{13})\b"
                }),

            NumeroInmueble = ExtractField(lines, fullText, "NumeroInmueble",
                // Label patterns - more flexible for OCR variations
                new[] { 
                    @"NO\.?\s*INMUEBLE", 
                    @"NO\.?\s*INM\.?",
                    @"N[ÚU]MERO\s*INMUEBLE", 
                    @"INMUEBLE\s*N[ÚU]MERO",
                    @"INMUEBLE\s*NO\.?",
                    @"NUMERO\s*INMUEBLE"
                },
                // Regex patterns - capture alphanumeric with hyphens
                new[] { 
                    @"(?:NO\.\s*INMUEBLE|N[ÚU]MERO\s*INMUEBLE|INMUEBLE\s*N[ÚU]MERO|INMUEBLE\s*NO|NO\s*INMUEBLE|NUMERO\s*INMUEBLE)\s*[:\-]?\s*([A-Z0-9\-\/]+)",
                    @"(?:INMUEBLE\s*)([A-Z0-9\-\/]{4,})"
                }),

            ParcelaNumero = ExtractField(lines, fullText, "ParcelaNumero",
                // Label patterns - more flexible for OCR variations
                new[] { 
                    @"PARCELA\s*NO\.?", 
                    @"PARCELA\s*N[ÚU]MERO", 
                    @"N[ÚU]MERO\s*DE\s*PARCELA",
                    @"NO\.?\s*PARCELA",
                    @"NUMERO\s*PARCELA"
                },
                // Regex patterns - capture alphanumeric with hyphens (cadastral format)
                new[] { 
                    @"(?:PARCELA\s*NO\.|PARCELA\s*N[ÚU]MERO|N[ÚU]MERO\s*DE\s*PARCELA|PARCELA\s*NO|NO\s*PARCELA|NUMERO\s*PARCELA)\s*[:\-]?\s*([A-Z0-9\-\/]+)",
                    @"(?:PARCELA\s*)([A-Z0-9\-\/]{4,})"
                })
        };

        var warnings = new List<string>();

        if (extraction.NumeroCertificacion.Status == FieldStatus.Missing ||
            extraction.NumeroInmueble.Status == FieldStatus.Missing ||
            extraction.ParcelaNumero.Status == FieldStatus.Missing)
        {
            extraction = extraction with { ExtractionStatus = ExtractionStatus.Incomplete };
        }

        if (extraction.NumeroCertificacion.Status == FieldStatus.Missing) 
            warnings.Add("No se pudo detectar el No. de Certificación en el documento.");
        if (extraction.NumeroInmueble.Status == FieldStatus.Missing) 
            warnings.Add("Falta el No. de Inmueble.");
        if (extraction.ParcelaNumero.Status == FieldStatus.Missing) 
            warnings.Add("Falta el número de parcela.");

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
                        var val = inlineMatch.Groups[1].Value.Trim();
                        if (val != "." && val != ":" && val != "-")
                        {
                            rawValue = val;
                            break;
                        }
                    }

                    // Check next line for proximity block (not another all-caps label)
                    if (i + 1 < lines.Count && !Regex.IsMatch(lines[i + 1], @"^[A-ZÁÉÍÓÚ\s\.\:\-]+$"))
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

            switch (fieldType)
            {
                case "NumeroCertificacion":
                case "NumeroInmueble":
                case "ParcelaNumero":
                    normalizedValue = SharedFieldNormalizer.NormalizeDesignacionCatastral(rawValue);
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