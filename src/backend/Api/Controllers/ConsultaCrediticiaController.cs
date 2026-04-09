namespace Api.Controllers;

using System;
using System.Threading;
using System.Threading.Tasks;
using Application.Features.Credit.Commands.ConsultarCredito;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/proyectos/{proyectoId:guid}/consulta-crediticia")]
[Authorize]
public class ConsultaCrediticiaController : ControllerBase
{
    private readonly ConsultarCreditoCommandHandler _consultarCreditoHandler;

    public ConsultaCrediticiaController(ConsultarCreditoCommandHandler consultarCreditoHandler)
    {
        _consultarCreditoHandler = consultarCreditoHandler;
    }

    [HttpPost]
    public async Task<IActionResult> ConsultarCredito(Guid proyectoId, CancellationToken ct)
    {
        var userId = Guid.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? Guid.Empty.ToString());
        var command = new ConsultarCreditoCommand { ProyectoId = proyectoId, UsuarioId = userId };
        
        var result = await _consultarCreditoHandler.Handle(command, ct);
        
        if (!result.IsSuccess)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }
}
