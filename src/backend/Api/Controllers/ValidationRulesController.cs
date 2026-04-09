namespace Api.Controllers;

using System;
using System.Threading;
using System.Threading.Tasks;
using Application.Features.ReglasValidacion.Commands.CreateRule;
using Application.Features.ReglasValidacion.Commands.ToggleRuleStatus;
using Application.Features.ReglasValidacion.Queries.GetValidationRules;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/admin/rules")]
[Authorize]
public class ValidationRulesController : ControllerBase
{
    private readonly CreateRuleCommandHandler _createHandler;
    private readonly ToggleRuleStatusCommandHandler _toggleHandler;
    private readonly GetValidationRulesQueryHandler _getHandler;

    public ValidationRulesController(
        CreateRuleCommandHandler createHandler,
        ToggleRuleStatusCommandHandler toggleHandler,
        GetValidationRulesQueryHandler getHandler)
    {
        _createHandler = createHandler;
        _toggleHandler = toggleHandler;
        _getHandler = getHandler;
    }

    [HttpGet]
    public async Task<IActionResult> GetRules(CancellationToken ct)
    {
        var query = new GetValidationRulesQuery();
        var result = await _getHandler.Handle(query, ct);
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> CreateRule([FromBody] CreateRuleCommand command, CancellationToken ct)
    {
        command.UsuarioId = GetUserId();
        command.IpOrigen = HttpContext.Connection.RemoteIpAddress?.ToString();
        command.UserAgent = Request.Headers["User-Agent"].ToString();

        var id = await _createHandler.Handle(command, ct);
        return CreatedAtAction(nameof(GetRules), new { id }, new { Id = id });
    }

    [HttpPatch("{id}/toggle")]
    public async Task<IActionResult> ToggleRule(Guid id, CancellationToken ct)
    {
        var command = new ToggleRuleStatusCommand
        {
            RuleId = id,
            UsuarioId = GetUserId(),
            IpOrigen = HttpContext.Connection.RemoteIpAddress?.ToString(),
            UserAgent = Request.Headers["User-Agent"].ToString()
        };

        var success = await _toggleHandler.Handle(command, ct);
        if (!success)
        {
            return NotFound(new { Mensaje = "Regla no encontrada." });
        }

        return NoContent();
    }

    private Guid? GetUserId()
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(userIdClaim, out var userId) ? userId : null;
    }
}
