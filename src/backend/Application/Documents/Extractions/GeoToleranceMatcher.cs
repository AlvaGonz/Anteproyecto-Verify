namespace Application.Documents.Extractions;

using System;
using System.Collections.Generic;
using System.Linq;

/// <summary>
/// 3-tier geographic matcher: exact ? alias ? fuzzy (Jaro-Winkler).
/// Resolution policy:
///   exact   = confidence 1.0 ? AutoApply
///   alias   = confidence 0.95 ? AutoApply
///   fuzzy   >= 0.90           ? AutoApply
///   fuzzy   0.80�0.89         ? Review (suggestion only, no auto-apply)
///   below   0.80 or not found ? unresolved ? Ignore
///
/// This class is pure � it takes catalog entries from the caller (no DB access).
/// DB access is GeoResolutionService''s concern.
/// </summary>
public static class GeoToleranceMatcher
{
    private const double ExactConfidence = 1.0;
    private const double AliasConfidence = 0.95;
    private const double AutoApplyThreshold = 0.90;
    private const double ReviewThreshold = 0.80;

    public static GeographicResolutionResult MatchProvincia(
        string rawInput,
        IReadOnlyList<(Guid Id, string Name)> catalog)
    {
        if (string.IsNullOrWhiteSpace(rawInput))
            return GeographicResolutionResult.Unresolved(rawInput, string.Empty);

        var normalized = GeoTextNormalizer.Normalize(rawInput);
        if (string.IsNullOrWhiteSpace(normalized))
            return GeographicResolutionResult.Unresolved(rawInput, normalized);

// Tier 1: exact match (normalized OCR == normalized catalog name)
        var exactMatch = catalog.FirstOrDefault(c =>
            string.Equals(GeoTextNormalizer.Normalize(c.Name), normalized, StringComparison.OrdinalIgnoreCase));

        if (exactMatch.Id != Guid.Empty)
        {
            return new GeographicResolutionResult
            {
                RawValue = rawInput,
                NormalizedValue = normalized,
                ResolvedId = exactMatch.Id,
                ResolvedName = exactMatch.Name,
                ResolutionMethod = "exact",
                Confidence = ExactConfidence
            };
        }

        // Tier 2: alias match
        var (aliasCanonical, matchedAliases) = ProvinciaAliasRegistry.Resolve(normalized);
        if (aliasCanonical != null)
        {
            var aliasEntry = catalog.FirstOrDefault(c =>
                string.Equals(c.Name, aliasCanonical, StringComparison.OrdinalIgnoreCase));

            if (aliasEntry.Id != Guid.Empty)
            {
                return new GeographicResolutionResult
                {
                    RawValue = rawInput,
                    NormalizedValue = normalized,
                    ResolvedId = aliasEntry.Id,
                    ResolvedName = aliasEntry.Name,
                    ResolutionMethod = "alias",
                    Confidence = AliasConfidence,
                    AliasesMatched = matchedAliases
                };
            }
        }

        // Tier 3: fuzzy (Jaro-Winkler)
        var bestScore = 0.0;
        (Guid Id, string Name) bestEntry = default;

        foreach (var entry in catalog)
        {
            var score = JaroWinkler(normalized, GeoTextNormalizer.Normalize(entry.Name));
            if (score > bestScore)
            {
                bestScore = score;
                bestEntry = entry;
            }
        }

        if (bestScore >= ReviewThreshold && bestEntry.Id != Guid.Empty)
        {
            return new GeographicResolutionResult
            {
                RawValue = rawInput,
                NormalizedValue = normalized,
                ResolvedId = bestEntry.Id,
                ResolvedName = bestEntry.Name,
                ResolutionMethod = "fuzzy",
                Confidence = Math.Round(bestScore, 4),
                Warnings = new List<string>
                {
                    bestScore >= AutoApplyThreshold
                        ? $"Fuzzy auto-apply ({bestScore:P0})."
                        : $"Fuzzy match in review zone ({bestScore:P0}) - confirm before applying."
                }
            };
        }

        return GeographicResolutionResult.Unresolved(rawInput, normalized);
    }

    /// <summary>
    /// Province-scoped municipality matcher.
    /// resolvedProvinciaId is used to scope the catalog; pass Guid.Empty to skip province filter.
    ///</summary>
    public static GeographicResolutionResult MatchMunicipio(
        string rawInput,
        IReadOnlyList<(Guid Id, string Name)> catalog,
        Guid resolvedProvinciaId)
    {
        // ponytail: reuse MatchProvincia logic � catalog is already filtered by caller
        // Province-scope filtering is performed by GeoResolutionService before calling this method
        return MatchProvincia(rawInput, catalog);
    }

    /// <summary>
    /// Scans full OCR text (or any block of tokens) for any 1-3 token window that matches
    /// a catalog entry. Used as a fallback when the per-field rawValue is empty/missing
    /// (e.g. PDFs without explicit "PROVINCIA:" / "MUNICIPIO:" labels).
    /// Returns the BEST (highest confidence) resolution across all candidates.
    ///</summary>
    public static GeographicResolutionResult MatchProvinciaFromText(
        string ocrText,
        IReadOnlyList<(Guid Id, string Name)> catalog)
    {
        if (string.IsNullOrWhiteSpace(ocrText) || catalog == null || catalog.Count == 0)
            return GeographicResolutionResult.Unresolved(string.Empty, string.Empty);

        // Candidate length windows that DR province/municipio names fall within:
        // e.g. "SAN CRISTOBAL" (12), "LA ALTAGRACIA" (12), "HIGUEY" (6), "LA VEGA" (7)
        const int MinTokens = 1;
        const int MaxTokens = 4;
        // Hard-cap total candidates per call so pathological OCRs don't OOM the matcher
        const int MaxCandidates = 256;

        var tokens = TokenizeForScan(ocrText);
        if (tokens.Count == 0)
            return GeographicResolutionResult.Unresolved(string.Empty, string.Empty);

        var candidates = new List<string>(Math.Min(MaxCandidates, tokens.Count * 2));
        for (var start = 0; start < tokens.Count && candidates.Count < MaxCandidates; start++)
        {
            for (var len = MinTokens; len <= MaxTokens && start + len <= tokens.Count; len++)
            {
                if (candidates.Count >= MaxCandidates) break;
                var candidate = string.Join(' ', tokens.GetRange(start, len));
                // Filter: skip empty / pure-numeric / single-char noise
                if (candidate.Length < 4) continue;
                if (IsAllDigits(candidate)) continue;
                candidates.Add(candidate);
            }
        }

        var best = GeographicResolutionResult.Unresolved(string.Empty, string.Empty);
        var bestScore = 0.0;

        foreach (var candidate in candidates)
        {
            // Skip exact pre-filter: skip if normalized candidate has length < 3
            var normalizedCandidate = GeoTextNormalizer.Normalize(candidate);
            if (normalizedCandidate.Length < 3) continue;

            var result = MatchProvincia(candidate, catalog);
            if (result.ResolvedId != null
                && (result.Confidence > bestScore
                    || (result.Confidence == bestScore
                        && (best.ResolvedId == null || result.ResolvedId != best.ResolvedId))))
            {
                best = result;
                bestScore = result.Confidence;
            }
        }

        // Only return a non-unresolved result if we found something
        if (best.ResolvedId == null)
            return GeographicResolutionResult.Unresolved(string.Empty, string.Empty);

        return best;
    }

    private static List<string> TokenizeForScan(string text)
    {
        // Split on whitespace and basic punctuation; keep alphabetic/digit runs.
        // Strips noise like ":", ",", "_" that PaddleOCR inserts between field parts.
        var tokens = new List<string>();
        var current = new System.Text.StringBuilder();
        foreach (var ch in text)
        {
            if (char.IsLetterOrDigit(ch))
                current.Append(ch);
            else
            {
                if (current.Length > 0)
                {
                    tokens.Add(current.ToString());
                    current.Clear();
                }
            }
        }
        if (current.Length > 0)
            tokens.Add(current.ToString());
        return tokens;
    }

    private static bool IsAllDigits(string s)
    {
        foreach (var c in s) if (!char.IsDigit(c)) return false;
        return s.Length > 0;
    }

    // -- Jaro-Winkler distance ---------------------------------------------------
    private static double JaroWinkler(string s1, string s2)
    {
        if (s1 == s2) return 1.0;
        if (s1.Length == 0 || s2.Length == 0) return 0.0;

        var jaro = Jaro(s1, s2);
        var prefixLen = 0;
        var maxPrefix = Math.Min(4, Math.Min(s1.Length, s2.Length));
        while (prefixLen < maxPrefix && s1[prefixLen] == s2[prefixLen])
            prefixLen++;

        return jaro + prefixLen * 0.1 * (1.0 - jaro);
    }

    private static double Jaro(string s1, string s2)
    {
        var matchWindow = Math.Max(s1.Length, s2.Length) / 2 - 1;
        if (matchWindow < 0) matchWindow = 0;

        var s1Matched = new bool[s1.Length];
        var s2Matched = new bool[s2.Length];
        var matches = 0;
        var transpositions = 0;

        for (int i = 0; i < s1.Length; i++)
        {
            var start = Math.Max(0, i - matchWindow);
            var end = Math.Min(i + matchWindow + 1, s2.Length);

            for (int j = start; j < end; j++)
            {
                if (s2Matched[j] || s1[i] != s2[j]) continue;
                s1Matched[i] = true;
                s2Matched[j] = true;
                matches++;
                break;
            }
        }

        if (matches == 0) return 0.0;

        var k = 0;
        for (int i = 0; i < s1.Length; i++)
        {
            if (!s1Matched[i]) continue;
            while (!s2Matched[k]) k++;
            if (s1[i] != s2[k]) transpositions++;
            k++;
        }

        return (matches / (double)s1.Length
            + matches / (double)s2.Length
            + (matches - transpositions / 2.0) / matches) / 3.0;
    }
}
