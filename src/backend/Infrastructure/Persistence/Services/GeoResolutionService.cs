namespace Infrastructure.Persistence.Services;

using Application.Contracts.Geo;
using Application.Documents.Extractions;
using System;
using System.Collections.Generic;
using System.Data;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

/// <summary>
/// DB-backed implementation of IGeoResolutionService.
/// Queries Provincia and Municipio tables via raw ADO.NET (same pattern as CatastroLookupRepository).
/// </summary>
public class GeoResolutionService : IGeoResolutionService
{
    private readonly AppDbContext _context;

    public GeoResolutionService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<GeographicResolutionResult> ResolveProvinciaAsync(
        string rawOcrValue, CancellationToken ct = default)
    {
        var catalog = await LoadCatalogAsync("SELECT IdProvincia, NombreProvincia FROM Provincia ORDER BY NombreProvincia", null, ct);
        return GeoToleranceMatcher.MatchProvincia(rawOcrValue, catalog);
    }

    public async Task<GeographicResolutionResult> ResolveProvinciaFromTextAsync(
        string ocrText, CancellationToken ct = default)
    {
        var catalog = await LoadCatalogAsync("SELECT IdProvincia, NombreProvincia FROM Provincia ORDER BY NombreProvincia", null, ct);
        return GeoToleranceMatcher.MatchProvinciaFromText(ocrText, catalog);
    }

    public async Task<GeographicResolutionResult> ResolveMunicipioFromTextAsync(
        string ocrText,
        Guid? resolvedProvinciaId,
        CancellationToken ct = default)
    {
        string sql;
        object? param = null;
        if (resolvedProvinciaId.HasValue)
        {
            sql = "SELECT IdMunicipio, NombreMunicipio FROM Municipio WHERE IdProvincia = @p0 ORDER BY NombreMunicipio";
            param = resolvedProvinciaId.Value;
        }
        else
        {
            sql = "SELECT IdMunicipio, NombreMunicipio FROM Municipio ORDER BY NombreMunicipio";
        }
        var catalog = await LoadCatalogAsync(sql, param, ct);
        return GeoToleranceMatcher.MatchProvinciaFromText(ocrText, catalog);
    }

    public async Task<GeographicResolutionResult> ResolveMunicipioAsync(
        string rawOcrValue, Guid? resolvedProvinciaId, CancellationToken ct = default)
    {
        string sql;
        object? param = null;
        if (resolvedProvinciaId.HasValue)
        {
            sql = "SELECT IdMunicipio, NombreMunicipio FROM Municipio WHERE IdProvincia = @p0 ORDER BY NombreMunicipio";
            param = resolvedProvinciaId.Value;
        }
        else
        {
            sql = "SELECT IdMunicipio, NombreMunicipio FROM Municipio ORDER BY NombreMunicipio";
        }
        var catalog = await LoadCatalogAsync(sql, param, ct);
        return GeoToleranceMatcher.MatchMunicipio(rawOcrValue, catalog, resolvedProvinciaId ?? Guid.Empty);
    }

    public async Task<List<(Guid Id, string Name)>> GetProvinceCatalogAsync()
    {
        return await LoadCatalogAsync("SELECT IdProvincia, NombreProvincia FROM Provincia ORDER BY NombreProvincia", null, CancellationToken.None);
    }

    public async Task<List<(Guid Id, string Name)>> GetMunicipioCatalogAsync(Guid? provinciaId)
    {
        string sql;
        object? param = null;
        if (provinciaId.HasValue)
        {
            sql = "SELECT IdMunicipio, NombreMunicipio FROM Municipio WHERE IdProvincia = @p0 ORDER BY NombreMunicipio";
            param = provinciaId.Value;
        }
        else
        {
            sql = "SELECT IdMunicipio, NombreMunicipio FROM Municipio ORDER BY NombreMunicipio";
        }
        return await LoadCatalogAsync(sql, param, CancellationToken.None);
    }

    private async Task<List<(Guid Id, string Name)>> LoadCatalogAsync(string sql, object? param, CancellationToken ct)
    {
        var result = new List<(Guid, string)>();
        var connection = _context.Database.GetDbConnection();
        var command = connection.CreateCommand();
        command.CommandText = sql;

        if (param != null)
        {
            var p = command.CreateParameter();
            p.ParameterName = "@p0";
            p.Value = param;
            command.Parameters.Add(p);
        }

        var wasOpen = connection.State == ConnectionState.Open;
        if (!wasOpen) await connection.OpenAsync(ct);
        try
        {
            using var reader = await command.ExecuteReaderAsync(ct);
            while (await reader.ReadAsync(ct))
            {
                var id = reader.GetGuid(0);
                var name = reader.IsDBNull(1) ? string.Empty : reader.GetString(1);
                if (!string.IsNullOrWhiteSpace(name))
                    result.Add((id, name));
            }
        }
        finally
        {
            if (!wasOpen) await connection.CloseAsync();
        }
        return result;
    }
}
