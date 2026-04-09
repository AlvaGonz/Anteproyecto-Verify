namespace Api.Controllers;

using System;
using System.Threading;
using System.Threading.Tasks;
using Application.Features.Validation.Commands.ValidarTerritorio;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/proyectos/{proyectoId:guid}/validacion-territorial")]
[Authorize]
public class ValidacionTerritorialController : ControllerBase
{
    private readonly ValidarTerritorioCommandHandler _validarTerritorioHandler;

    public ValidacionTerritorialController(ValidarTerritorioCommandHandler validarTerritorioHandler)
    {
        _validarTerritorioHandler = validarTerritorioHandler;
    }

    [HttpPost]
    public async Task<IActionResult> ValidarTerritorio(Guid proyectoId, CancellationToken ct)
    {
        var userId = Guid.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? Guid.Empty.ToString());
        var command = new ValidarTerritorioCommand { ProyectoId = proyectoId, UsuarioId = userId };
        var result = await _validarTerritorioHandler.Handle(command, ct);
        return Ok(result);
    }
}
