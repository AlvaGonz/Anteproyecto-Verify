namespace Api.Controllers;

using System;
using System.Threading;
using System.Threading.Tasks;
using Application.Features.Sello.Commands.EmitirSello;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/proyectos/{proyectoId:guid}/sello-integridad")]
[Authorize]
public class SelloIntegridadController : ControllerBase
{
    private readonly EmitirSelloCommandHandler _emitirSelloHandler;

    public SelloIntegridadController(EmitirSelloCommandHandler emitirSelloHandler)
    {
        _emitirSelloHandler = emitirSelloHandler;
    }

    [HttpPost]
    public async Task<IActionResult> EmitirSello(Guid proyectoId, CancellationToken ct)
    {
        var userId = Guid.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? Guid.Empty.ToString());
        var command = new EmitirSelloCommand { ProyectoId = proyectoId, UsuarioId = userId };
        
        var result = await _emitirSelloHandler.Handle(command, ct);
        
        if (!result.IsSuccess)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }
}
