using System.Threading.Tasks;
using Application.Contracts.Gobernanza;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class GobernanzaDeDatosController : ControllerBase
{
    private readonly IGobernanzaDeDatosService _gobernanzaService;

    public GobernanzaDeDatosController(IGobernanzaDeDatosService gobernanzaService)
    {
        _gobernanzaService = gobernanzaService;
    }

    [HttpPost("verificar/catastro")]
    [ProducesResponseType(typeof(VerificationResult), StatusCodes.Status200OK)]
    public async Task<IActionResult> VerificarCatastro([FromBody] CatastroVerificationRequest request)
    {
        var result = await _gobernanzaService.VerificarCatastroAsync(request);
        return Ok(result);
    }

    [HttpPost("verificar/jce")]
    [ProducesResponseType(typeof(VerificationResult), StatusCodes.Status200OK)]
    public async Task<IActionResult> VerificarJce([FromBody] JceVerificationRequest request)
    {
        var result = await _gobernanzaService.VerificarJceAsync(request);
        return Ok(result);
    }

    [HttpPost("verificar/dgii")]
    [ProducesResponseType(typeof(VerificationResult), StatusCodes.Status200OK)]
    public async Task<IActionResult> VerificarDgii([FromBody] DgiiVerificationRequest request)
    {
        var result = await _gobernanzaService.VerificarDgiiAsync(request);
        return Ok(result);
    }

    [HttpPost("verificar/permisosuelo")]
    [ProducesResponseType(typeof(VerificationResult), StatusCodes.Status200OK)]
    public async Task<IActionResult> VerificarPermisoSuelo([FromBody] PermisoSueloVerificationRequest request)
    {
        var result = await _gobernanzaService.VerificarPermisoSueloAsync(request);
        return Ok(result);
    }

    [HttpPost("verificar/pagoipi")]
    [ProducesResponseType(typeof(VerificationResult), StatusCodes.Status200OK)]
    public async Task<IActionResult> VerificarIpi([FromBody] IpiVerificationRequest request)
    {
        var result = await _gobernanzaService.VerificarIpiAsync(request);
        return Ok(result);
    }
}
