namespace Api.Controllers;

using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Application.Features.PublicVerification.Queries.SearchGlobal;

[ApiController]
[Route("api/v1/search")]
[AllowAnonymous] // Assuming public search is allowed
public class GlobalSearchController : ControllerBase
{
    private readonly SearchGlobalQueryHandler _searchHandler;

    public GlobalSearchController(SearchGlobalQueryHandler searchHandler)
    {
        _searchHandler = searchHandler;
    }

    [HttpGet("global")]
    public async Task<IActionResult> SearchGlobal([FromQuery] string type, [FromQuery] string q, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(type) || string.IsNullOrWhiteSpace(q))
        {
            return BadRequest(new { Message = "Los parámetros 'type' y 'q' son requeridos." });
        }

        var query = new SearchGlobalQuery(type, q);
        var result = await _searchHandler.HandleAsync(query, ct);

        if (result == null)
        {
            return NotFound(new { Message = "No se encontraron resultados para la consulta especificada." });
        }

        return Ok(result);
    }
}
