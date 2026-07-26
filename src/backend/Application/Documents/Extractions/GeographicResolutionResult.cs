namespace Application.Documents.Extractions;

using System;
using System.Collections.Generic;

/// <summary>
/// Canonical serializable result of a geographic field (Provincia/Municipio) resolution attempt.
/// This record is a pure data contract � no operational policy, no thresholds.
/// Resolution policy (zones, auto-apply vs review) is determined by GeoToleranceMatcher.
/// </summary>
public record GeographicResolutionResult
{
    public string RawValue { get; init; } = string.Empty;
    public string NormalizedValue { get; init; } = string.Empty;

    /// <summary>IdProvincia or IdMunicipio from the DB catalog. Null if unresolved.</summary>
    public Guid? ResolvedId { get; init; }

    /// <summary>The official canonical name from the DB catalog.</summary>
    public string? ResolvedName { get; init; }

    /// <summary>How the match was made: "exact" | "alias" | "fuzzy" | "unresolved"</summary>
    public string ResolutionMethod { get; init; } = "unresolved";

    /// <summary>Match confidence score: 1.0 = exact, 0.95 = alias, 0.0 = unresolved.</summary>
    public double Confidence { get; init; }

    /// <summary>Derived UX action: AutoApply | Review | Ignore. Computed from ResolutionMethod + Confidence.</summary>
    public ResolutionAction SuggestedAction => ComputeSuggestedAction();

    /// <summary>Which alias keys matched, for debugging and UI display.</summary>
    public List<string> AliasesMatched { get; init; } = new();

    /// <summary>Non-critical warnings about the resolution process.</summary>
    public List<string> Warnings { get; init; } = new();

    public static GeographicResolutionResult Unresolved(string raw, string normalized) => new()
    {
        RawValue = raw,
        NormalizedValue = normalized,
        ResolutionMethod = "unresolved",
        Confidence = 0.0
    };

    private ResolutionAction ComputeSuggestedAction()
    {
        return ResolutionMethod switch
        {
            "exact" => ResolutionAction.AutoApply,
            "alias" => ResolutionAction.AutoApply,
            "fuzzy" when Confidence >= 0.90 => ResolutionAction.AutoApply,
            "fuzzy" when Confidence >= 0.80 => ResolutionAction.Review,
            _ => ResolutionAction.Ignore
        };
    }
}

public enum ResolutionAction
{
    /// <summary>Confidence >= 0.90 or method is exact/alias � safe to auto-apply to form.</summary>
    AutoApply = 0,
    /// <summary>Fuzzy confidence 0.80�0.89 � show suggestion, require user confirmation.</summary>
    Review = 1,
    /// <summary>Confidence < 0.80 or unresolved � do not suggest.</summary>
    Ignore = 2
}
