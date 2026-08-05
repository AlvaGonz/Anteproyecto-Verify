namespace Application.Documents.Extractions;

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
        
        // Remove spaces, punctuation, and hyphens
        var clean = Regex.Replace(raw, @"[^a-zA-Z0-9]", "");
        return clean.ToUpperInvariant();
    }

    public static string NormalizeSuperficie(string raw)
    {
        if (string.IsNullOrWhiteSpace(raw)) return string.Empty;
        
        var cleanRaw = raw.Trim();
        var dotCount = cleanRaw.Count(c => c == '.');

        if (dotCount >= 2)
        {
            var lastDot = cleanRaw.LastIndexOf('.');
            var beforeDecimal = cleanRaw.Substring(0, lastDot).Replace(".", "");
            cleanRaw = beforeDecimal + cleanRaw.Substring(lastDot);
        }
        else
        {
            cleanRaw = cleanRaw.Replace(",", "");
        }

        cleanRaw = cleanRaw.Replace(" ", "");
        var match = Regex.Match(cleanRaw, @"\d+(\.\d+)?");
        if (match.Success)
        {
            if (decimal.TryParse(match.Value, System.Globalization.CultureInfo.InvariantCulture, out var area))
            {
                return area.ToString(System.Globalization.CultureInfo.InvariantCulture);
            }
        }
        
        return string.Empty;
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
