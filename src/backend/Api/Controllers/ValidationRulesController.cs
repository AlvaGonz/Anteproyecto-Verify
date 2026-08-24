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

using Application.Features.ReglasValidacion.Commands.SetDiscrepancyEnabled;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Persistence;

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
    private readonly AppDbContext _context;

    public ValidationRulesController(
        CreateRuleCommandHandler createHandler,
        UpdateRuleCommandHandler updateHandler,
        ToggleRuleStatusCommandHandler toggleHandler,
        GetValidationRulesQueryHandler getHandler,
        GetValidationRuleByIdQueryHandler getByIdHandler,
        EvaluateRuleCommandHandler evaluateHandler,
        AppDbContext context)
    {
        _createHandler = createHandler;
        _updateHandler = updateHandler;
        _toggleHandler = toggleHandler;
        _getHandler = getHandler;
        _getByIdHandler = getByIdHandler;
        _evaluateHandler = evaluateHandler;
        _context = context;
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

    [HttpGet("global/discrepancy-enabled")]
    [HttpGet("/api/validationrules/global/discrepancy-enabled")]
    public async Task<ActionResult<bool>> GetDiscrepancyEnabled(CancellationToken ct = default)
    {
        var regla = await _context.ReglasValidacion
            .AsNoTracking()
            .FirstOrDefaultAsync(r => r.Codigo == "GLOBAL-DISCREPANCY-ENABLED", ct);

        if (regla == null)
        {
            return Ok(true);
        }

        return Ok(regla.Activa && regla.ValorUmbral == 1.0m);
    }

    [HttpPut("global/discrepancy-enabled")]
    [HttpPut("/api/validationrules/global/discrepancy-enabled")]
    public async Task<IActionResult> SetDiscrepancyEnabled([FromBody] SetDiscrepancyEnabledDto dto, CancellationToken ct = default)
    {
        var userId = GetUserId();
        var userRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;

        if (User.Identity?.IsAuthenticated == true && !string.IsNullOrEmpty(userRole) && 
            !userRole.Equals("Admin", StringComparison.OrdinalIgnoreCase) && 
            !userRole.Equals("Administrator", StringComparison.OrdinalIgnoreCase))
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { Mensaje = "Acceso denegado. Se requiere rol de Administrador." });
        }

        var regla = await _context.ReglasValidacion
            .FirstOrDefaultAsync(r => r.Codigo == "GLOBAL-DISCREPANCY-ENABLED", ct);

        if (regla == null)
        {
            regla = new ReglaValidacion(
                nombre: "Habilitar Validación de Discrepancias",
                descripcion: "Controla si se ejecuta la comparación de discrepancias proyecto-vs-documento",
                condicionLogica: "global.enabled == true",
                tipoDocumentoAplicable: DocumentType.OTHER,
                nivelAlerta: NivelAlerta.Baja,
                tipoProyecto: TipoProyecto.Residencial,
                creadaPor: userId ?? Guid.Empty,
                version: 1,
                reglaAnteriorId: null,
                valorUmbral: dto.Enabled ? 1.0m : 0.0m,
                minValor: 0.0m,
                maxValor: 1.0m,
                expresion: "global.enabled == true",
                codigo: "GLOBAL-DISCREPANCY-ENABLED",
                id: Guid.Parse("00000000-0000-0000-0000-000000000099")
            );
            if (!dto.Enabled)
            {
                regla.Desactivar();
            }
            await _context.ReglasValidacion.AddAsync(regla, ct);
        }
        else
        {
            regla.Update(
                regla.Nombre,
                regla.Descripcion,
                regla.CondicionLogica,
                regla.TipoDocumentoAplicable,
                regla.NivelAlerta,
                regla.TipoProyecto,
                valorUmbral: dto.Enabled ? 1.0m : 0.0m,
                minValor: 0.0m,
                maxValor: 1.0m,
                expresion: "global.enabled == true",
                codigo: "GLOBAL-DISCREPANCY-ENABLED",
                activa: dto.Enabled
            );
        }

        var auditoria = new Auditoria(
            userId,
            TipoOperacion.ReglaModificada,
            "ConfiguracionReglas",
            $"Configuración global de validación de discrepancias actualizada a: {(dto.Enabled ? "Habilitada" : "Deshabilitada")}.",
            null,
            HttpContext.Connection.RemoteIpAddress?.ToString(),
            Request.Headers["User-Agent"].ToString()
        );
        _context.Auditorias.Add(auditoria);

        try
        {
            await _context.SaveChangesAsync(ct);
            return NoContent();
        }
        catch (DbUpdateConcurrencyException)
        {
            return Conflict(new { Mensaje = "La configuración fue modificada concurrentemente por otro usuario." });
        }
    }

    private Guid? GetUserId()
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(userIdClaim, out var userId) ? userId : null;
    }
}
