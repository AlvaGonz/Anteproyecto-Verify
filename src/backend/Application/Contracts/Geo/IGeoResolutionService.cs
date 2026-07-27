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

    Task<GeographicResolutionResult> ResolveMunicipioAsync(
        string rawOcrValue,
        Guid? resolvedProvinciaId,
        CancellationToken ct = default);
}
