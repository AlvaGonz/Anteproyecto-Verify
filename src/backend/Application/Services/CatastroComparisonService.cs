namespace Application.Services;

using System;
using Application.DTOs.Integrations;
using Domain.Entities;

public class CatastroComparisonService
{
    public CatastroComparisonResult Compare(Proyecto proyecto, CatastroResponseDto catastroData)
    {
        var result = new CatastroComparisonResult();

        // Compare location (GPS)
        if (!string.IsNullOrWhiteSpace(proyecto.UbicacionGps) && !string.IsNullOrWhiteSpace(catastroData.CoordenadasGps))
        {
            if (!proyecto.UbicacionGps.Equals(catastroData.CoordenadasGps, StringComparison.OrdinalIgnoreCase))
            {
                result.HasDiscrepancies = true;
                result.LocationDiscrepancy = $"Ubicación GPS difiere. Expediente: {proyecto.UbicacionGps}, Catastro: {catastroData.CoordenadasGps}";
            }
        }

        // Compare area (assuming we had area in Proyecto, but we don't, so let's just mock a comparison or skip it if not present)
        // For now, let's just check if there's a difference in DesignacionCatastral
        if (!string.IsNullOrWhiteSpace(proyecto.DesignacionCatastral) && !string.IsNullOrWhiteSpace(catastroData.DesignacionCatastral))
        {
            if (!proyecto.DesignacionCatastral.Equals(catastroData.DesignacionCatastral, StringComparison.OrdinalIgnoreCase))
            {
                result.HasDiscrepancies = true;
                result.LimitsDiscrepancy = $"Designación Catastral difiere. Expediente: {proyecto.DesignacionCatastral}, Catastro: {catastroData.DesignacionCatastral}";
            }
        }

        return result;
    }
}
