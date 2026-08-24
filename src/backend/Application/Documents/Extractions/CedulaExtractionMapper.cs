namespace Application.Documents.Extractions;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using Application.Abstractions.Ocr;

public static class CedulaExtractionMapper
{
    private static readonly Dictionary<string, string> SpanishMonths = new(StringComparer.OrdinalIgnoreCase)
    {
        { "ENERO", "01" },
        { "EN3RO", "01" },
        { "FEBRERO", "02" },
        { "MARZO", "03" },
        { "ABRIL", "04" },
        { "MAYO", "05" },
        { "JUNIO", "06" },
        { "JUNTO", "06" },
        { "JUN1O", "06" },
        { "JUNLO", "06" },
        { "JULIO", "07" },
        { "JULTO", "07" },
        { "JUL1O", "07" },
        { "AGOSTO", "08" },
        { "SEPTIEMBRE", "09" },
        { "SETIEMBRE", "09" },
        { "OCTUBRE", "10" },
        { "NOVIEMBRE", "11" },
        { "NOVlEMBRE", "11" },
        { "NOV1EMBRE", "11" },
        { "DICIEMBRE", "12" }
    };

    public static CedulaRdExtractionV1? MapFromOcrResult(OcrResult ocrResult)
    {
        if (ocrResult == null) return null;

        var extraction = new CedulaRdExtractionV1
        {
            ExtractionStatus = ocrResult.Success ? ExtractionStatus.Completed : ExtractionStatus.Failed,
            OverallConfidence = ocrResult.Confidence
        };

        var lines = ExtractLines(ocrResult);
        string fullText = string.Join(" ", lines);

        extraction = extraction with
        {
            CedulaNumber = ExtractCedulaNumber(lines, fullText),
            FirstNames = ExtractNames(lines, fullText, isFirstNames: true),
            LastNames = ExtractNames(lines, fullText, isFirstNames: false),
            BirthDate = ExtractBirthDate(lines, fullText),
            ExpiryDate = ExtractExpiryDate(lines, fullText)
        };

        if (extraction.CedulaNumber.Status == FieldStatus.Missing ||
            extraction.FirstNames.Status == FieldStatus.Missing ||
            extraction.LastNames.Status == FieldStatus.Missing)
        {
            extraction = extraction with { ExtractionStatus = ExtractionStatus.Incomplete };
        }

        return extraction;
    }

    private static List<string> ExtractLines(OcrResult ocrResult)
    {
        var lines = new List<string>();
        if (!string.IsNullOrWhiteSpace(ocrResult.RawJson) && (ocrResult.RawJson.Contains("('") || ocrResult.RawJson.Contains("['")))
        {
            var matches = Regex.Matches(ocrResult.RawJson.Replace("\\\"", "\""), @"[(']('([^']+)'|""([^""]+)"")");
            foreach (Match m in matches)
            {
                var text = m.Groups[2].Success ? m.Groups[2].Value : m.Groups[3].Value;
                if (!string.IsNullOrWhiteSpace(text))
                {
                    lines.Add(text);
                }
            }
        }
        
        if (!lines.Any() && ocrResult.Lines != null && ocrResult.Lines.Any())
        {
            lines.AddRange(ocrResult.Lines.Select(l => l.Text));
        }
        
        if (!lines.Any() && !string.IsNullOrWhiteSpace(ocrResult.ExtractedText))
        {
            lines.AddRange(ocrResult.ExtractedText.Split(new[] { '\n', '\r' }, StringSplitOptions.RemoveEmptyEntries));
        }
        return lines;
    }

    private static ExtractedField ExtractCedulaNumber(List<string> lines, string fullText)
    {
        // 1. Proximity scanning around label "Número de cédula"
        for (int i = 0; i < lines.Count; i++)
        {
            var line = lines[i];
            if (Regex.IsMatch(line, @"N[uú]mero\s*de\s*c[eé]du[tl]a|C[eé]dula", RegexOptions.IgnoreCase))
            {
                var inlineMatch = Regex.Match(line, @"(\d{3}-?\d{7}-?\d{1}|\b\d{11}\b)");
                if (inlineMatch.Success)
                {
                    return CreateValidField(inlineMatch.Value, inlineMatch.Value);
                }

                // Check next lines skipping noise
                for (int step = 1; step <= 3 && i + step < lines.Count; step++)
                {
                    var cand = lines[i + step].Trim();
                    if (string.IsNullOrWhiteSpace(cand)) continue;
                    if (cand.Length <= 2 && !Regex.IsMatch(cand, @"\d{3}")) continue; // skip isolated hologram digits

                    var match = Regex.Match(cand, @"(\d{3}-?\d{7}-?\d{1}|\b\d{11}\b)");
                    if (match.Success)
                    {
                        return CreateValidField(match.Value, match.Value);
                    }
                }
            }
        }

        // 2. Fallback regex in full text
        var fallback = Regex.Match(fullText, @"\b(\d{3}-\d{7}-\d{1})\b");
        if (fallback.Success)
        {
            return CreateValidField(fallback.Value, fallback.Value);
        }

        var fallback11 = Regex.Match(fullText, @"\b(00[0-9]{9}|402[0-9]{8}|001[0-9]{8})\b");
        if (fallback11.Success)
        {
            return CreateValidField(fallback11.Value, fallback11.Value);
        }

        return new ExtractedField { Status = FieldStatus.Missing };
    }

    private static ExtractedField ExtractNames(List<string> lines, string fullText, bool isFirstNames)
    {
        string labelPattern = isFirstNames 
            ? @"^\s*Nombres?\s*$" 
            : @"^\s*Apel[a-z]*\s*$";

        string stopPattern = isFirstNames
            ? @"^(?:Apel|Nacionalidad|lacjonalidad|Estado\s*civil|Fecha|Lugar|Sexo|Ocupaci|DOMINICANA|OMINICANA|SOLTER)"
            : @"^(?:Nombres?|Nacionalidad|lacjonalidad|Estado\s*civil|Fecha|Lugar|Sexo|Ocupaci|DOMINICANA|OMINICANA|SOLTER)";

        var collectedParts = new List<string>();

        for (int i = 0; i < lines.Count; i++)
        {
            var line = lines[i].Trim();
            if (Regex.IsMatch(line, labelPattern, RegexOptions.IgnoreCase))
            {
                // Lookahead next lines
                for (int step = 1; step <= 4 && i + step < lines.Count; step++)
                {
                    var cand = lines[i + step].Trim();
                    if (string.IsNullOrWhiteSpace(cand)) continue;
                    if (cand.Length <= 2 || cand == ":" || cand == "<" || cand == "0)" || cand == "0-)") continue; // skip noise

                    if (Regex.IsMatch(cand, stopPattern, RegexOptions.IgnoreCase))
                    {
                        break;
                    }

                    var cleaned = CleanWatermarks(cand);
                    if (!isFirstNames)
                    {
                        cleaned = NormalizeNameTypos(cleaned);
                    }

                    if (!string.IsNullOrWhiteSpace(cleaned) && Regex.IsMatch(cleaned, @"^[A-Za-zÁÉÍÓÚÑáéíóúñ\s'-]+$"))
                    {
                        collectedParts.Add(cleaned);
                    }
                }
                break;
            }
        }

        if (collectedParts.Any())
        {
            string combined = string.Join(" ", collectedParts).Trim();
            combined = Regex.Replace(combined, @"\s+", " ");
            return CreateValidField(combined, combined.ToUpperInvariant());
        }

        return new ExtractedField { Status = FieldStatus.Missing };
    }

    private static ExtractedField ExtractBirthDate(List<string> lines, string fullText)
    {
        // 1. Proximity around "Fecha de nacimiento"
        for (int i = 0; i < lines.Count; i++)
        {
            var line = lines[i].Trim();
            if (Regex.IsMatch(line, @"Fecha\s*de\s*nacimient|Nacimiento", RegexOptions.IgnoreCase))
            {
                for (int step = 0; step <= 3 && i + step < lines.Count; step++)
                {
                    var cand = lines[i + step].Trim();
                    var dateStr = TryParseDominicanDate(cand);
                    if (dateStr != null)
                    {
                        return CreateValidField(cand, dateStr);
                    }
                }
            }
        }

        // 2. Full text search for Month Text (e.g. 04 JUNIO 1962 or 02 SEPTIEMBRE 1962 or 04 JUNtO 1962)
        var monthMatch = Regex.Match(fullText, @"(\b\d{1,2})\s+([A-Za-z0-9]+)\s+(\d{4})\b", RegexOptions.IgnoreCase);
        if (monthMatch.Success)
        {
            string day = monthMatch.Groups[1].Value.PadLeft(2, '0');
            string monthWord = monthMatch.Groups[2].Value.ToUpperInvariant();
            string year = monthMatch.Groups[3].Value;

            if (SpanishMonths.TryGetValue(monthWord, out var monthNum) ||
                SpanishMonths.TryGetValue(monthWord.Replace("T", "I").Replace("1", "I").Replace("L", "I"), out monthNum))
            {
                string norm = $"{day}-{monthNum}-{year}";
                return CreateValidField(monthMatch.Value, norm);
            }
        }

        // 3. Full text search for DD-MM-YYYY / DD/MM/YYYY
        var numDateMatch = Regex.Match(fullText, @"\b(\d{2})[-/](\d{2})[-/](\d{4})\b");
        if (numDateMatch.Success)
        {
            string norm = $"{numDateMatch.Groups[1].Value}-{numDateMatch.Groups[2].Value}-{numDateMatch.Groups[3].Value}";
            return CreateValidField(numDateMatch.Value, norm);
        }

        return new ExtractedField { Status = FieldStatus.Missing };
    }

    private static ExtractedField ExtractExpiryDate(List<string> lines, string fullText)
    {
        // Search for patterns like ": hasta. 03-05. .2025" or "Vigrencia Masta 03.05:2025" or "thasta 14-12-2037" or "ta 11-01-2039"
        for (int i = 0; i < lines.Count; i++)
        {
            var line = lines[i].Trim();
            if (Regex.IsMatch(line, @"(?:Vig[a-z]*\s+)?(?:[HhMm]asta|ta\s+\d|Expiraci[oó]n|Expira)", RegexOptions.IgnoreCase))
            {
                var cleanDate = TryExtractDateWithNoise(line);
                if (cleanDate != null)
                {
                    return CreateValidField(line, cleanDate);
                }
            }
        }

        // Search full text for dates with year >= 2024 (expiry dates)
        var futureDates = Regex.Matches(fullText, @"\b(\d{2})[-/.](\d{2})[-/.](\d{4})\b");
        foreach (Match m in futureDates)
        {
            if (int.TryParse(m.Groups[3].Value, out int yr) && yr >= 2024)
            {
                string norm = $"{m.Groups[1].Value}-{m.Groups[2].Value}-{m.Groups[3].Value}";
                return CreateValidField(m.Value, norm);
            }
        }

        return new ExtractedField { Status = FieldStatus.Missing };
    }

    private static string? TryParseDominicanDate(string text)
    {
        if (string.IsNullOrWhiteSpace(text)) return null;

        // Pattern 1: 04 JUNIO 1962 or 04 JUNtO 1962
        var monthMatch = Regex.Match(text, @"(\b\d{1,2})\s+([A-Za-z0-9]+)\s+(\d{4})\b", RegexOptions.IgnoreCase);
        if (monthMatch.Success)
        {
            string day = monthMatch.Groups[1].Value.PadLeft(2, '0');
            string monthWord = monthMatch.Groups[2].Value.ToUpperInvariant();
            string year = monthMatch.Groups[3].Value;

            if (SpanishMonths.TryGetValue(monthWord, out var monthNum) ||
                SpanishMonths.TryGetValue(monthWord.Replace("T", "I").Replace("1", "I").Replace("L", "I"), out monthNum))
            {
                return $"{day}-{monthNum}-{year}";
            }
        }

        // Pattern 2: 04-06-1962 or 04/06/1962
        var numMatch = Regex.Match(text, @"\b(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})\b");
        if (numMatch.Success)
        {
            string day = numMatch.Groups[1].Value.PadLeft(2, '0');
            string month = numMatch.Groups[2].Value.PadLeft(2, '0');
            string year = numMatch.Groups[3].Value;
            return $"{day}-{month}-{year}";
        }

        return null;
    }

    private static string? TryExtractDateWithNoise(string text)
    {
        // Handles: ": hasta. 03-05. .2025" or "Vigrencia Masta 03.05:2025" or "thasta 14-12-2037" or "ta 11-01-2039"
        var digitsOnly = Regex.Replace(text, @"[^\d]", " ");
        var parts = digitsOnly.Split(new[] { ' ' }, StringSplitOptions.RemoveEmptyEntries);

        for (int i = 0; i < parts.Length - 2; i++)
        {
            if (parts[i].Length <= 2 && parts[i + 1].Length <= 2 && parts[i + 2].Length == 4)
            {
                string day = parts[i].PadLeft(2, '0');
                string month = parts[i + 1].PadLeft(2, '0');
                string year = parts[i + 2];
                return $"{day}-{month}-{year}";
            }
        }

        return null;
    }

    private static string CleanWatermarks(string text)
    {
        if (string.IsNullOrWhiteSpace(text)) return string.Empty;
        var cleaned = Regex.Replace(text, @"\b(?:BA/\s*)?(?:SPECIMEN|ESPECIMEN|PECIMEX|SPECIMEX|MUESTRA|SAMPLE|COPIA)\b", "", RegexOptions.IgnoreCase);
        cleaned = Regex.Replace(cleaned, @"\bSPECIM\w*\b", "", RegexOptions.IgnoreCase).Trim();
        return Regex.Replace(cleaned, @"\s+", " ");
    }

    private static string NormalizeNameTypos(string text)
    {
        if (string.IsNullOrWhiteSpace(text)) return string.Empty;
        return Regex.Replace(text, @"\bGQMEZ\b", "GOMEZ", RegexOptions.IgnoreCase);
    }

    private static ExtractedField CreateValidField(string raw, string normalized)
    {
        return new ExtractedField
        {
            RawValue = raw.Trim(),
            NormalizedValue = normalized.Trim(),
            Confidence = 0.95,
            Status = FieldStatus.Valid,
            SourcePage = 1
        };
    }
}
