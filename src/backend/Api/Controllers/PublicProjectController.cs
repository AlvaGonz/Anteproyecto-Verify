namespace Api.Controllers;

using System.Threading;
using System.Threading.Tasks;
using Application.Features.PublicConsulta.Queries.GetFeaturedProjects;
using Application.Features.PublicConsulta.Queries.GetPublicProjectStatus;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/public/projects")]
[AllowAnonymous]
public class PublicProjectController : ControllerBase
{
    private readonly GetPublicProjectStatusQueryHandler _handler;
    private readonly Application.Features.PublicConsulta.Queries.SearchPublicProjects.SearchPublicProjectsQueryHandler _searchHandler;
    private readonly GetFeaturedProjectsQueryHandler _featuredHandler;

    public PublicProjectController(
        GetPublicProjectStatusQueryHandler handler,
        Application.Features.PublicConsulta.Queries.SearchPublicProjects.SearchPublicProjectsQueryHandler searchHandler,
        GetFeaturedProjectsQueryHandler featuredHandler)
    {
        _handler = handler;
        _searchHandler = searchHandler;
        _featuredHandler = featuredHandler;
    }

    [HttpGet("featured")]
    public async Task<IActionResult> GetFeatured([FromQuery] int count = 5, CancellationToken ct = default)
    {
        var query = new GetFeaturedProjectsQuery
        {
            Count = count,
            IpOrigen = HttpContext.Connection.RemoteIpAddress?.ToString(),
            UserAgent = Request.Headers["User-Agent"].ToString()
        };

        var result = await _featuredHandler.Handle(query, ct);
        return Ok(result);
    }

    [HttpGet("search")]
    public async Task<IActionResult> Search([FromQuery] string? q, CancellationToken ct)
    {
        var query = new Application.Features.PublicConsulta.Queries.SearchPublicProjects.SearchPublicProjectsQuery
        {
            Query = q ?? "",
            IpOrigen = HttpContext.Connection.RemoteIpAddress?.ToString(),
            UserAgent = Request.Headers["User-Agent"].ToString()
        };

        var result = await _searchHandler.Handle(query, ct);
        return Ok(result);
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
