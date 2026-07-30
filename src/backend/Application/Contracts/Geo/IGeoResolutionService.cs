namespace Application.Contracts.Geo;

using Application.Documents.Extractions;
using System;
using System.Threading;
using System.Threading.Tasks;

/// <summary>
/// Resolves a raw OCR geographic string against the DB-backed Provincia/Municipio catalog.
/// Implementations must NOT be called from within static mappers (keep mappers sync and pure).
/// Resolution is injected as a post-map enrichment step in DocumentService.
/// </summary>
public interface IGeoResolutionService
{
    Task<GeographicResolutionResult> ResolveProvinciaAsync(string rawOcrValue, CancellationToken ct = default);

    /// <summary>
    /// Scans the full OCR text (rather than a single per-field rawValue) for any
    /// province-name candidate. Used as a fallback when the OCR mapper returned an
    /// empty provincia.rawValue (e.g. PDFs where the "PROVINCIA:" label is missing
    /// but a province name still appears somewhere in the OCR text).
    ///</summary>
    Task<GeographicResolutionResult> ResolveProvinciaFromTextAsync(string ocrText, CancellationToken ct = default);

    /// <summary>
    /// Scans the full OCR text for any municipio-name candidate. Like
    /// ResolveProvinciaFromTextAsync but for municipio. If resolvedProvinciaId is
    /// provided the catalog is province-scoped to that province.
    ///</summary>
    Task<GeographicResolutionResult> ResolveMunicipioFromTextAsync(
        string ocrText,
        Guid? resolvedProvinciaId,
        CancellationToken ct = default);

    Task<GeographicResolutionResult> ResolveMunicipioAsync(
        string rawOcrValue,
        Guid? resolvedProvinciaId,
        CancellationToken ct = default);
}
