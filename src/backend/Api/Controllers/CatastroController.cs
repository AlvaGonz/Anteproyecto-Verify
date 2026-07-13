namespace Api.Controllers;

using System;
using System.Threading.Tasks;
using Application.Contracts.Projects;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/projects/[controller]")]
[Authorize]
public class CatastroController : ControllerBase
{
    private readonly ICatastroLookupRepository _repository;

    public CatastroController(ICatastroLookupRepository repository)
    {
        _repository = repository;
    }

    [HttpGet("lookup")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> LookupCatastroByGps([FromQuery] string latitud, [FromQuery] string longitud)
    {
        if (!decimal.TryParse(latitud, out var lat) || !decimal.TryParse(longitud, out var lon))
        {
            return BadRequest(new { message = "Invalid coordinates." });
        }

        var latRounded = Math.Round(lat, 6);
        var lonRounded = Math.Round(lon, 6);

        var result = await _repository.GetByGpsAsync(latRounded, lonRounded);

        if (result == null)
        {
            return NotFound(new { message = "No data found for the given coordinates." });
        }

        return Ok(result);
    }
}
