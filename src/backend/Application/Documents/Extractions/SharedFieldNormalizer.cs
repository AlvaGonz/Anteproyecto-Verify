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
        
        // Remove spaces, punctuation except hyphen
        var clean = Regex.Replace(raw, @"[^a-zA-Z0-9-]", "");
        return clean.ToUpperInvariant();
    }

    public static string NormalizeSuperficie(string raw)
    {
        if (string.IsNullOrWhiteSpace(raw)) return string.Empty;
        
        // Typically in DR: 1,200.50 (comma for thousands, dot for decimals)
        var cleanRaw = raw.Replace(",", "").Replace(" ", "");
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

    public static string NormalizeEscala(string raw)
    {
        if (string.IsNullOrWhiteSpace(raw)) return string.Empty;
        var clean = raw.Replace(" ", "");
        var match = Regex.Match(clean, @"\d+:\d+");
        if (match.Success)
        {
            var parts = match.Value.Split(':');
            if (parts.Length == 2)
            {
                var p1 = parts[0];
                if (p1.Length > 1 && p1.StartsWith("1")) p1 = "1";
                return $"{p1}:{parts[1]}";
            }
            return match.Value;
        }
        return raw.Trim();
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
