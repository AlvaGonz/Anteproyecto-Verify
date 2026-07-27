namespace Api.Controllers;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Contracts.Geo;
using Infrastructure.Persistence.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/geo")]
[AllowAnonymous]
public class GeoController : ControllerBase
{
    private readonly IGeoResolutionService _geoResolutionService;

    public GeoController(IGeoResolutionService geoResolutionService)
    {
        _geoResolutionService = geoResolutionService;
    }

    [HttpGet("provincias")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetProvincias()
    {
        var geoService = _geoResolutionService as GeoResolutionService;
        if (geoService == null)
        {
            return StatusCode(500, "Geo service not available");
        }
        
        var catalog = await geoService.GetProvinceCatalogAsync();
        return Ok(catalog.Select(c => new { id = c.Id, nombre = c.Name }));
    }

    [HttpGet("municipios")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMunicipios([FromQuery] Guid? provinciaId)
    {
        var geoService = _geoResolutionService as GeoResolutionService;
        if (geoService == null)
        {
            return StatusCode(500, "Geo service not available");
        }
        
        var catalog = await geoService.GetMunicipioCatalogAsync(provinciaId);
        return Ok(catalog.Select(c => new { id = c.Id, nombre = c.Name }));
    }
}