namespace Api.Controllers;

using System;
using System.Threading;
using System.Threading.Tasks;
using Application.Features.ReglasValidacion.Commands.CreateRule;
using Application.Features.ReglasValidacion.Commands.EvaluateRule;
using Application.Features.ReglasValidacion.Commands.ToggleRuleStatus;
using Application.Features.ReglasValidacion.Commands.UpdateRule;
using Application.Features.ReglasValidacion.Queries.GetValidationRuleById;
using Application.Features.ReglasValidacion.Queries.GetValidationRules;
using Domain.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/admin/rules")]
// [Authorize] // TODO: Enable when auth is fully implemented
public class ValidationRulesController : ControllerBase
{
    private readonly CreateRuleCommandHandler _createHandler;
    private readonly UpdateRuleCommandHandler _updateHandler;
    private readonly ToggleRuleStatusCommandHandler _toggleHandler;
    private readonly GetValidationRulesQueryHandler _getHandler;
    private readonly GetValidationRuleByIdQueryHandler _getByIdHandler;
    private readonly EvaluateRuleCommandHandler _evaluateHandler;

    public ValidationRulesController(
        CreateRuleCommandHandler createHandler,
        UpdateRuleCommandHandler updateHandler,
        ToggleRuleStatusCommandHandler toggleHandler,
        GetValidationRulesQueryHandler getHandler,
        GetValidationRuleByIdQueryHandler getByIdHandler,
        EvaluateRuleCommandHandler evaluateHandler)
    {
        _createHandler = createHandler;
        _updateHandler = updateHandler;
        _toggleHandler = toggleHandler;
        _getHandler = getHandler;
        _getByIdHandler = getByIdHandler;
        _evaluateHandler = evaluateHandler;
    }

    [HttpGet]
    public async Task<IActionResult> GetRules(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        CancellationToken ct = default)
    {
        var query = new GetValidationRulesQuery { Page = page, PageSize = pageSize };
        var result = await _getHandler.Handle(query, ct);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetRuleById(Guid id, CancellationToken ct = default)
    {
        var query = new GetValidationRuleByIdQuery { Id = id };
        var result = await _getByIdHandler.Handle(query, ct);
        if (result == null)
        {
            return NotFound(new { Mensaje = "Regla de validación no encontrada." });
        }
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> CreateRule([FromBody] CreateRuleCommand command, CancellationToken ct)
    {
        command.UsuarioId = GetUserId();
        command.IpOrigen = HttpContext.Connection.RemoteIpAddress?.ToString();
        command.UserAgent = Request.Headers["User-Agent"].ToString();

        try
        {
            var id = await _createHandler.Handle(command, ct);
            return CreatedAtAction(nameof(GetRuleById), new { id }, new { Id = id });
        }
        catch (DomainException ex)
        {
            return BadRequest(new { Mensaje = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateRule(Guid id, [FromBody] UpdateRuleCommand command, CancellationToken ct)
    {
        if (id != command.Id && command.Id != Guid.Empty)
        {
            return BadRequest(new { Mensaje = "El ID de la ruta no coincide con el cuerpo de la solicitud." });
        }
        command.Id = id;
        command.UsuarioId = GetUserId();
        command.IpOrigen = HttpContext.Connection.RemoteIpAddress?.ToString();
        command.UserAgent = Request.Headers["User-Agent"].ToString();

        try
        {
            var success = await _updateHandler.Handle(command, ct);
            if (!success)
            {
                return NotFound(new { Mensaje = "Regla de validación no encontrada." });
            }

            return NoContent();
        }
        catch (DbUpdateConcurrencyException)
        {
            return Conflict(new { Mensaje = "La regla fue modificada por otro usuario. Recarga la página para ver los cambios más recientes." });
        }
        catch (DomainException ex)
        {
            return BadRequest(new { Mensaje = ex.Message });
        }
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

    [HttpPost("evaluar")]
    public async Task<IActionResult> EvaluateRule([FromBody] EvaluateRuleCommand command, CancellationToken ct)
    {
        try
        {
            var result = await _evaluateHandler.Handle(command, ct);
            if (result == null)
            {
                return NotFound(new { Mensaje = "Regla no encontrada o inactiva." });
            }

            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { Mensaje = ex.Message });
        }
    }

    private Guid? GetUserId()
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(userIdClaim, out var userId) ? userId : null;
    }
}
