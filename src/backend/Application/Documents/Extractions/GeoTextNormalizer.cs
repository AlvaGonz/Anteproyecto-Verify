namespace Application.Documents.Extractions;

using System;
using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;

/// <summary>
/// Single entry point for all geographic text normalization (Provincia, Municipio).
/// Produces a canonical uppercase ASCII key suitable for catalog comparison.
/// Does NOT perform alias resolution or fuzzy matching � those live in GeoToleranceMatcher.
/// </summary>
public static class GeoTextNormalizer
{
    // Known OCR noise prefixes to strip (order matters � longest first)
    private static readonly string[] _noisePrefixes =
    {
        "PODERJUDICIALREPUBLICADOMINICANA",   // concatenated OCR garbage
        "PODER JUDICIAL REPUBLICA DOMINICANA",
        "PODER JUDICIAL",
        "REPUBLICA DOMINICANA",
        "OFICINA",
    };

// Abbreviation expansions applied AFTER uppercase + accent strip
    private static readonly (string Pattern, string Replacement)[] _abbreviations =
    {
        (@"\bSTO\.\s*", "SANTO "),
        (@"\bSTA\.\s*", "SANTA "),
        (@"\bSAN\s+JOS\b", "SAN JOSE"),
        (@"\bSTO\b",  "SANTO"),
        (@"\bSTA\b",  "SANTA"),
        (@"\bDGO\b", "DOMINGO"),
        (@"\bDGO\.\b", "DOMINGO"),
    };

    /// <summary>
    /// Normalizes a raw OCR geographic value to a canonical uppercase ASCII key.
    /// Pipeline: NFC ? uppercase ? strip diacritics ? expand abbreviations ? strip noise prefixes ? collapse whitespace ? trim.
    /// </summary>
    public static string Normalize(string? raw)
    {
        if (string.IsNullOrWhiteSpace(raw)) return string.Empty;

        // 1. Unicode NFC normalize
        var nfc = raw.Normalize(NormalizationForm.FormC);

        // 2. Uppercase
        var upper = nfc.ToUpperInvariant();

        // 3. Strip diacritics / accents
        var decomposed = upper.Normalize(NormalizationForm.FormD);
        var sb = new StringBuilder(decomposed.Length);
        foreach (var ch in decomposed)
        {
            if (CharUnicodeInfo.GetUnicodeCategory(ch) != UnicodeCategory.NonSpacingMark)
                sb.Append(ch);
        }
        var stripped = sb.ToString().Normalize(NormalizationForm.FormC);

        // 4. Expand abbreviations
        var expanded = stripped;
        foreach (var (pattern, replacement) in _abbreviations)
            expanded = Regex.Replace(expanded, pattern, replacement, RegexOptions.IgnoreCase);

        // 5. Strip known noise prefixes
        var result = expanded.Trim();
        foreach (var prefix in _noisePrefixes)
        {
            if (result.StartsWith(prefix, StringComparison.OrdinalIgnoreCase))
            {
                result = result.Substring(prefix.Length).TrimStart();
                break; // apply only the first matching prefix
            }
        }

// 6. Collapse all whitespace (spaces, tabs, newlines) to single space
        result = Regex.Replace(result, @"\s+", " ").Trim();

        // 7. Remove interior punctuation noise (commas) - e.g., "LA, ALTAGRACIA" -> "LA ALTAGRACIA"
        result = Regex.Replace(result, @",", " ").Trim();

        // 8. Re-collapse whitespace after comma removal
        result = Regex.Replace(result, @"\s+", " ").Trim();

        // 9. Remove trailing punctuation noise (periods, commas, semicolons) but preserve interior punctuation
        result = Regex.Replace(result, @"[.,;]+$", "").Trim();

        return result;
    }
}
