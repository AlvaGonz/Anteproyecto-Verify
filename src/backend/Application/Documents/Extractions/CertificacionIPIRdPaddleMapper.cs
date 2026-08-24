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
            NumeroCertificacion = ExtractCertificacion(lines, fullText),
            NumeroInmueble = ExtractInmueble(lines, fullText),
            ParcelaNumero = ExtractParcela(lines, fullText)
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
        else if (!string.IsNullOrWhiteSpace(ocrResult.ExtractedText))
        {
            lines.AddRange(ocrResult.ExtractedText.Split(new[] { '\n', '\r' }, System.StringSplitOptions.RemoveEmptyEntries));
        }
        return lines;
    }

    private static ExtractedField ExtractCertificacion(List<string> lines, string fullText)
    {
        string? raw = null;

        // 1. Direct line scan with label + value
        for (int i = 0; i < lines.Count; i++)
        {
            var line = lines[i].Trim();

            // Ignore legal disclaimers mentioning juicio de valor
            if (line.Contains("juicio", System.StringComparison.OrdinalIgnoreCase) ||
                line.Contains("declaraciones presentadas", System.StringComparison.OrdinalIgnoreCase))
            {
                continue;
            }

            // Check inline "No. de Certificación: 338738592876" or "No.deCertificaci6nC0121952878225"
            var m = Regex.Match(line, @"(?:NO\.?\s*(?:DE\s*)?CERTIFICACI[OÓ6]N|N[ÚU]MERO\s*(?:DE\s*)?CERTIFICACI[OÓ6]N|CERTIFICACI[OÓ6]N\s*NO\.?|CERT\.?\s*NO\.?)\s*[:\-]?\s*([A-Z0-9\-\/]+)", RegexOptions.IgnoreCase);
            if (m.Success && !string.IsNullOrWhiteSpace(m.Groups[1].Value))
            {
                raw = m.Groups[1].Value.Trim();
                break;
            }

            // Check proximity (label on line, value on next line)
            if (Regex.IsMatch(line, @"^(?:NO\.?\s*(?:DE\s*)?CERTIFICACI[OÓ6]N|N[ÚU]MERO\s*(?:DE\s*)?CERTIFICACI[OÓ6]N|CERTIFICACI[OÓ6]N\s*NO\.?|CERT\.?\s*NO\.?)\s*[:\-]?$", RegexOptions.IgnoreCase))
            {
                if (i + 1 < lines.Count)
                {
                    var next = lines[i + 1].Trim();
                    if (!string.IsNullOrWhiteSpace(next) && !next.Contains("CERTIFICA", System.StringComparison.OrdinalIgnoreCase))
                    {
                        raw = next;
                        break;
                    }
                }
            }
        }

        // 2. Regex fallback in fullText
        if (string.IsNullOrWhiteSpace(raw))
        {
            var m = Regex.Match(fullText, @"(?:NO\.?\s*(?:DE\s*)?CERTIFICACI[OÓ6]N|N[ÚU]MERO\s*(?:DE\s*)?CERTIFICACI[OÓ6]N)\s*[:\-]?\s*([A-Z0-9\-\/]{6,})", RegexOptions.IgnoreCase);
            if (m.Success)
            {
                raw = m.Groups[1].Value.Trim();
            }
        }

        if (string.IsNullOrWhiteSpace(raw))
        {
            var m = Regex.Match(fullText, @"\b([Cc]\d{10,13})\b");
            if (m.Success)
            {
                raw = m.Groups[1].Value.Trim();
            }
        }

        if (!string.IsNullOrWhiteSpace(raw))
        {
            raw = raw.Trim().TrimEnd('.', ',');
            // Clean out prefix labels if accidentally captured
            raw = Regex.Replace(raw, @"^(?:NO\.?\s*(?:DE\s*)?CERTIFICACI[OÓ6]N\s*[:\-]?)+", "", RegexOptions.IgnoreCase).Trim();

            // Extract alphanumeric characters only, preserving hyphens if in code like CERT-2024-001234
            string normalized = raw.Contains('-') 
                ? Regex.Replace(raw, @"[^A-Za-z0-9\-]", "").ToUpperInvariant()
                : Regex.Replace(raw, @"[^A-Za-z0-9]", "").ToUpperInvariant();

            if (normalized.Length >= 4)
            {
                return new ExtractedField
                {
                    RawValue = raw,
                    NormalizedValue = normalized,
                    Confidence = 0.9,
                    Status = FieldStatus.Valid,
                    SourcePage = 1
                };
            }
        }

        return new ExtractedField { Status = FieldStatus.Missing };
    }

    private static ExtractedField ExtractInmueble(List<string> lines, string fullText)
    {
        string? raw = null;

        // 1. Direct line scan
        for (int i = 0; i < lines.Count; i++)
        {
            var line = lines[i].Trim();

            // Check if line is ONLY a label, then value is on next line (proximity)
            if (Regex.IsMatch(line, @"^(?:NO\.?\s*INMUEB[IL1]E|INMUEB[IL1]E\s*(?:NO\.?|N[ÚU]MERO|NUM\.?)|N[ÚU]MERO\s*INMUEB[IL1]E|NO\.?\s*INM\b\.?)\s*[:\-]?$", RegexOptions.IgnoreCase))
            {
                if (i + 1 < lines.Count)
                {
                    var next = lines[i + 1].Trim().TrimEnd(',', '.');
                    if (next.Length >= 4 && !Regex.IsMatch(next, @"^(?:PARCELA|CERTIFICACION|TITULO)", RegexOptions.IgnoreCase))
                    {
                        raw = next;
                        break;
                    }
                }
            }

            // Match inline: "Inmuebie no. 070223482149:0021" or "inmueble no.136400513193" or "NO. INMUEBLE: INM-456789"
            var m = Regex.Match(line, @"(?:NO\.?\s*INMUEB[IL1]E|N[ÚU]MERO\s*INMUEB[IL1]E|INMUEB[IL1]E\s*(?:NO\.?|N[ÚU]MERO|NUM\.?)|NO\.?\s*INM\b\.?)\s*[:\-]?\s*([0-9]{10,14}(?::[0-9]{1,4})?|[A-Z0-9\-\/:]+)", RegexOptions.IgnoreCase);
            if (m.Success && !string.IsNullOrWhiteSpace(m.Groups[1].Value))
            {
                var val = m.Groups[1].Value.Trim().TrimEnd(',', '.');
                if (val.Length >= 4 && val != "SN" && !val.Equals("CERTIFICA", System.StringComparison.OrdinalIgnoreCase))
                {
                    raw = val;
                    break;
                }
            }
        }

        // 2. Full text regex fallback
        if (string.IsNullOrWhiteSpace(raw))
        {
            var m = Regex.Match(fullText, @"(?:NO\.?\s*INMUEB[IL1]E|N[ÚU]MERO\s*INMUEB[IL1]E|INMUEB[IL1]E\s*(?:NO\.?|N[ÚU]MERO|NUM\.?)|NO\.?\s*INM\b\.?)\s*[:\-]?\s*([0-9]{10,14}(?::[0-9]{1,4})?|[A-Z0-9\-\/:]+)", RegexOptions.IgnoreCase);
            if (m.Success)
            {
                raw = m.Groups[1].Value.Trim().TrimEnd(',', '.');
            }
        }

        if (!string.IsNullOrWhiteSpace(raw))
        {
            raw = raw.Trim().TrimEnd('.', ',');
            string normalized = raw.Trim();

            return new ExtractedField
            {
                RawValue = raw,
                NormalizedValue = normalized,
                Confidence = 0.9,
                Status = FieldStatus.Valid,
                SourcePage = 1
            };
        }

        return new ExtractedField { Status = FieldStatus.Missing };
    }

    private static ExtractedField ExtractParcela(List<string> lines, string fullText)
    {
        string? raw = null;

        // 1. Direct line scan
        for (int i = 0; i < lines.Count; i++)
        {
            var line = lines[i].Trim();

            // Check proximity (label only on line)
            if (Regex.IsMatch(line, @"^(?:(?:identificado\s*(?:camo|como)\s*)?PARCELA\s*(?:NO\.?|N[ÚU]MERO|NUM\.?)|N[ÚU]MERO\s*DE\s*PARCELA|NO\.?\s*PARCELA)\s*[:\-]?$", RegexOptions.IgnoreCase))
            {
                if (i + 1 < lines.Count)
                {
                    var next = lines[i + 1].Trim().TrimEnd(',', '.');
                    if (next.Length >= 4 && !Regex.IsMatch(next, @"^(?:INMUEBLE|CERTIFICACION|TITULO)", RegexOptions.IgnoreCase))
                    {
                        raw = next;
                        break;
                    }
                }
            }

            // Match inline "Parcela No. 070223482149, D.C. No." or "Parcela No.309466754512:4-A" or "PARCELA NO.: 3094667545124-AD"
            var m = Regex.Match(line, @"(?:(?:identificado\s*(?:camo|como)\s*)?PARCELA\s*(?:NO\.?|N[ÚU]MERO|NUM\.?)|N[ÚU]MERO\s*DE\s*PARCELA|NO\.?\s*PARCELA)\s*[:\-]?\s*([A-Z0-9\-\/:]+)", RegexOptions.IgnoreCase);
            if (m.Success && !string.IsNullOrWhiteSpace(m.Groups[1].Value))
            {
                var val = m.Groups[1].Value.Trim().TrimEnd(',', '.');
                if (val.Length >= 4)
                {
                    raw = val;
                    break;
                }
            }
        }

        // 2. Full text regex fallback
        if (string.IsNullOrWhiteSpace(raw))
        {
            var m = Regex.Match(fullText, @"(?:(?:identificado\s*(?:camo|como)\s*)?PARCELA\s*(?:NO\.?|N[ÚU]MERO|NUM\.?))\s*[:\-]?\s*([A-Z0-9\-\/:]+)", RegexOptions.IgnoreCase);
            if (m.Success)
            {
                raw = m.Groups[1].Value.Trim().TrimEnd(',', '.');
            }
        }

        if (!string.IsNullOrWhiteSpace(raw))
        {
            raw = raw.Trim().TrimEnd('.', ',');
            string normalized = NormalizeParcela(raw);

            return new ExtractedField
            {
                RawValue = raw,
                NormalizedValue = normalized,
                Confidence = 0.9,
                Status = FieldStatus.Valid,
                SourcePage = 1
            };
        }

        return new ExtractedField { Status = FieldStatus.Missing };
    }

    /// <summary>
    /// Parcela catastral format: digits → optional :digits → optional -letter(s).
    /// Truncates noise after the valid suffix (e.g. "89754213098:5-BDCNOS..." → "89754213098:5-B").
    /// </summary>
    private static string NormalizeParcela(string raw)
    {
        // Stop before any trailing D.C., Solar, Manzana, Apto labels
        var cleaned = Regex.Replace(raw, @"[\s,]+(?:D\.?C\.?|Solar|Manzana|Apto|Unidad).*$", "", RegexOptions.IgnoreCase).Trim();

        var clean = Regex.Replace(cleaned, @"[^A-Za-z0-9:-]", "");

        if (!clean.Contains(':'))
        {
            var repair = Regex.Match(clean, @"^(\d{10,12})(\d)(-[A-Za-z0-9]{1,2})$");
            if (repair.Success)
            {
                clean = $"{repair.Groups[1].Value}:{repair.Groups[2].Value}{repair.Groups[3].Value}";
            }
        }

        var match = Regex.Match(clean, @"^(\d+(?::\d+(?:-[A-Za-z])?|-[A-Za-z]+)?)", RegexOptions.IgnoreCase);
        return match.Success ? match.Groups[1].Value.ToUpperInvariant() : clean.ToUpperInvariant();
    }
}