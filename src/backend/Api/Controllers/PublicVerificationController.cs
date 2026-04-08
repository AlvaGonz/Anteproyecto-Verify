namespace Api.Controllers;

using System.Threading;
using System.Threading.Tasks;
using Application.Features.PublicVerification.Queries.GetPublicProjectVerification;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/public/verify")]
public class PublicVerificationController : ControllerBase
{
    private readonly GetPublicProjectVerificationQueryHandler _getHandler;

    public PublicVerificationController(GetPublicProjectVerificationQueryHandler getHandler)
    {
        _getHandler = getHandler;
    }

    [HttpGet("{code}")]
    public async Task<IActionResult> VerifyCode(string code, CancellationToken cancellationToken)
    {
        var result = await _getHandler.HandleAsync(code, cancellationToken);
        if (result == null)
        {
            return NotFound(new { Message = "Código de verificación no válido o no encontrado." });
        }
        return Ok(result);
    }
}
