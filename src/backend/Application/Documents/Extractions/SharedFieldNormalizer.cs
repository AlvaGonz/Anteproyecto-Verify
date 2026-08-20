namespace Application.Documents.Extractions;

using System;
using System.Globalization;
using System.Linq;
using System.Text.RegularExpressions;

public static class SharedFieldNormalizer
{
    public static string NormalizeMatricula(string raw)
    {
        if (string.IsNullOrWhiteSpace(raw)) return string.Empty;
        
        // Remove spaces, punctuation except hyphen
        var clean = Regex.Replace(raw, @"[^a-zA-Z0-9-]", "");
        clean = clean.ToUpperInvariant();
        if (clean.StartsWith("NO") && clean.Length > 2)
        {
            clean = clean.Substring(2);
        }
        return clean;
    }

    public static string NormalizeDesignacionCatastral(string raw)
    {
        if (string.IsNullOrWhiteSpace(raw)) return string.Empty;
        
        var trimmed = raw.Trim();
        // Remove extraneous label words if caught in raw value
        trimmed = Regex.Replace(trimmed, @"^(?:DESIGNACI[OÓ]N\s+CATASTRAL|PARCELA|SOLAR)\s*[:\-]?\s*", "", RegexOptions.IgnoreCase);

        // Clean spaces and unwanted chars, but KEEP hyphens and colons
        var clean = Regex.Replace(trimmed, @"[^a-zA-Z0-9-:]", "").ToUpperInvariant();

        // If it's a 16-digit sequence without colon (12 posicional + 4 suffix), format as XXXXXXXXXXXX:XXXX
        if (Regex.IsMatch(clean, @"^\d{16}$"))
        {
            return $"{clean.Substring(0, 12)}:{clean.Substring(12, 4)}";
        }

        // If it's a numeric code with internal dashed OCR artifact (e.g. 42018023893-1-1 -> 4201802389311)
        if (Regex.IsMatch(clean, @"^\d{8,14}(-\d+)+$"))
        {
            return clean.Replace("-", "");
        }

        return clean;
    }

    public static string NormalizeSuperficie(string raw)
    {
        if (string.IsNullOrWhiteSpace(raw)) return string.Empty;
        
        var cleanRaw = raw.Trim();
        // Strip unit suffix
        cleanRaw = Regex.Replace(cleanRaw, @"(?i)\s*(?:m2|m²|mts2|metr[oa]s?\s*cuadrados?|mtr?os\.?\s*cuadrados?|m\b).*$", "");
        cleanRaw = cleanRaw.Trim();

        var dotCount = cleanRaw.Count(c => c == '.');
        var commaCount = cleanRaw.Count(c => c == ',');

        if (dotCount >= 2)
        {
            // European format: 14.792.83 -> 14792.83
            var lastDot = cleanRaw.LastIndexOf('.');
            var beforeDecimal = cleanRaw.Substring(0, lastDot).Replace(".", "");
            cleanRaw = beforeDecimal + cleanRaw.Substring(lastDot);
        }
        else if (commaCount > 0 && dotCount == 1)
        {
            // US format: 12,130.07 -> 12130.07
            cleanRaw = cleanRaw.Replace(",", "");
        }
        else if (commaCount == 1 && dotCount == 0)
        {
            // Comma decimal: 1183,36 -> 1183.36
            cleanRaw = cleanRaw.Replace(",", ".");
        }
        else if (commaCount > 1)
        {
            var lastComma = cleanRaw.LastIndexOf(',');
            var beforeDecimal = cleanRaw.Substring(0, lastComma).Replace(",", "");
            cleanRaw = beforeDecimal + "." + cleanRaw.Substring(lastComma + 1);
        }

        cleanRaw = cleanRaw.Replace(" ", "");
        var match = Regex.Match(cleanRaw, @"\d+(\.\d+)?");
        if (match.Success)
        {
            if (decimal.TryParse(match.Value, NumberStyles.Any, CultureInfo.InvariantCulture, out var area))
            {
                return area.ToString(CultureInfo.InvariantCulture);
            }
        }
        
        return string.Empty;
    }

    public static string NormalizeVieneDe(string raw)
    {
        if (string.IsNullOrWhiteSpace(raw)) return string.Empty;
        
        var clean = raw.Trim();
        // Strip label if included
        clean = Regex.Replace(clean, @"^(?:VIENE\s+DE|VIENEDE|VIENEFE|VIENE\.?D[E]?|CANCELA\s+LA\s+ANTERIOR)\s*[:\-]?\s*", "", RegexOptions.IgnoreCase);
        // Collapse spaces around punctuation: e.g. "F.414, X.85" -> "F.414,X.85", "L. 948 , F. 73" -> "L.948,F.73"
        clean = Regex.Replace(clean, @"\s*([,\.:])\s*", "$1");
        clean = Regex.Replace(clean, @"\s+", " ").Trim();
        return clean.ToUpperInvariant();
    }

    public static string NormalizeFecha(string raw)
    {
        if (string.IsNullOrWhiteSpace(raw)) return string.Empty;

        var clean = raw.Trim();
        // Replace Spanish month abbreviations
        var monthMap = new (string Abbr, string Num)[]
        {
            ("ene", "01"), ("feb", "02"), ("mar", "03"), ("abr", "04"),
            ("may", "05"), ("jun", "06"), ("jul", "07"), ("ago", "08"),
            ("sep", "09"), ("set", "09"), ("oct", "10"), ("nov", "11"), ("dic", "12")
        };

        foreach (var (abbr, num) in monthMap)
        {
            clean = Regex.Replace(clean, $@"(?i)\b{abbr}\w*\b", num);
        }

        // Match dd-MM-yyyy or dd/MM/yyyy or yyyy-MM-dd
        var matchIso = Regex.Match(clean, @"\b(\d{4})[/-](\d{1,2})[/-](\d{1,2})\b");
        if (matchIso.Success)
        {
            var y = matchIso.Groups[1].Value;
            var m = matchIso.Groups[2].Value.PadLeft(2, '0');
            var d = matchIso.Groups[3].Value.PadLeft(2, '0');
            return $"{d}-{m}-{y}";
        }

        var matchStandard = Regex.Match(clean, @"\b(\d{1,2})[/-](\d{1,2})[/-](\d{4})\b");
        if (matchStandard.Success)
        {
            var d = matchStandard.Groups[1].Value.PadLeft(2, '0');
            var m = matchStandard.Groups[2].Value.PadLeft(2, '0');
            var y = matchStandard.Groups[3].Value;
            return $"{d}-{m}-{y}";
        }

        return clean;
    }

    public static string NormalizeOficina(string raw)
    {
        if (string.IsNullOrWhiteSpace(raw)) return string.Empty;
        var clean = raw.Trim();
        // Strip common prefix "REGISTRO DE TITULOS DE " / "OFICINA DE "
        clean = Regex.Replace(clean, @"^(?:REGISTRO\s+DE\s+T[IÍ]TULOS\s+(?:DE\s+|DEL\s+)?|OFICINA\s+(?:DE\s+|DEL\s+)?)", "", RegexOptions.IgnoreCase).Trim();
        clean = clean.ToUpperInvariant();
        if (clean == "PUERTOPLATA") clean = "PUERTO PLATA";
        return clean;
    }

    public static string NormalizeOperacion(string raw)
    {
        if (string.IsNullOrWhiteSpace(raw)) return string.Empty;
        var upper = raw.ToUpperInvariant().Replace(" ", "");
        if (upper.Contains("SUBDI")) return "SUBDIVISION";
        if (upper.Contains("PLANOCATASTRAL")) return "PLANO CATASTRAL";
        if (upper.Contains("SANEAMIENTO")) return "SANEAMIENTO";
        if (upper.Contains("DESLINDE")) return "DESLINDE";
        if (upper.Contains("REFUNDICION")) return "REFUNDICION";
        return raw.Trim();
    }
}

