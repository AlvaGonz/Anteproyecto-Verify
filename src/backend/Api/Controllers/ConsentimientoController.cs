namespace Api.Controllers;

using System;
using System.Threading;
using System.Threading.Tasks;
using Application.Features.Consentimiento.Commands.RegistrarConsentimiento;
using Application.Features.Consentimiento.Queries.VerificarConsentimientoVigente;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/consentimiento")]
[Authorize]
public class ConsentimientoController : ControllerBase
{
    private readonly RegistrarConsentimientoCommandHandler _registrarHandler;
    private readonly VerificarConsentimientoVigenteQueryHandler _verificarHandler;

    public ConsentimientoController(
        RegistrarConsentimientoCommandHandler registrarHandler,
        VerificarConsentimientoVigenteQueryHandler verificarHandler)
    {
        _registrarHandler = registrarHandler;
        _verificarHandler = verificarHandler;
    }

    [HttpPost]
    public async Task<IActionResult> Registrar([FromBody] RegistrarConsentimientoRequest request, CancellationToken ct)
    {
        var userId = Guid.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? Guid.Empty.ToString());
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "0.0.0.0";

        var command = new RegistrarConsentimientoCommand
        {
            UsuarioId = userId,
            IpOrigen = ipAddress,
            VersionPolitica = request.VersionPolitica
        };

        var result = await _registrarHandler.Handle(command, ct);
        return Ok(result);
    }

    [HttpGet("vigente")]
    public async Task<IActionResult> VerificarVigencia(CancellationToken ct)
    {
        var userId = Guid.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? Guid.Empty.ToString());
        var query = new VerificarConsentimientoVigenteQuery { UsuarioId = userId };
        var result = await _verificarHandler.Handle(query, ct);
        return Ok(result);
    }
}

public class RegistrarConsentimientoRequest
{
    public string VersionPolitica { get; set; } = string.Empty;
}
