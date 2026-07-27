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
    /// </summary>
    public static GeographicResolutionResult MatchMunicipio(
        string rawInput,
        IReadOnlyList<(Guid Id, string Name)> catalog,
        Guid resolvedProvinciaId)
    {
        // ponytail: reuse MatchProvincia logic � catalog is already filtered by caller
        // Province-scope filtering is performed by GeoResolutionService before calling this method
        return MatchProvincia(rawInput, catalog);
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
