namespace Api.Controllers;

using System.Threading;
using System.Threading.Tasks;
using Application.Features.PublicConsulta.Queries.GetPublicProjectStatus;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/public/projects")]
[AllowAnonymous]
public class PublicProjectController : ControllerBase
{
    private readonly GetPublicProjectStatusQueryHandler _handler;

    public PublicProjectController(GetPublicProjectStatusQueryHandler handler)
    {
        _handler = handler;
    }

    [HttpGet("{codigoPublico}")]
    public async Task<IActionResult> GetByCodigo(string codigoPublico, CancellationToken ct)
    {
        var query = new GetPublicProjectStatusQuery
        {
            CodigoPublico = codigoPublico,
            IpOrigen = HttpContext.Connection.RemoteIpAddress?.ToString(),
            UserAgent = Request.Headers["User-Agent"].ToString()
        };

        var result = await _handler.Handle(query, ct);
        if (result == null)
        {
            return NotFound(new { Mensaje = "Proyecto no encontrado o código inválido." });
        }

        return Ok(result);
    }

    [HttpGet("qr/{qrToken}")]
    public async Task<IActionResult> GetByQrToken(string qrToken, CancellationToken ct)
    {
        var query = new GetPublicProjectStatusQuery
        {
            QrToken = qrToken,
            IpOrigen = HttpContext.Connection.RemoteIpAddress?.ToString(),
            UserAgent = Request.Headers["User-Agent"].ToString()
        };

        var result = await _handler.Handle(query, ct);
        if (result == null)
        {
            return NotFound(new { Mensaje = "Proyecto no encontrado o token inválido." });
        }

        return Ok(result);
    }
}
