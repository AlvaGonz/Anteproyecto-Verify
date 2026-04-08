namespace Api.Controllers;

using System;
using System.Threading;
using System.Threading.Tasks;
using Application.Features.Validation.Commands.CheckDuplicateExpediente;
using Application.Features.Validation.Commands.EvaluateDocumentFormality;
using Application.Features.Validation.Commands.ExecuteAyuntamientoValidation;
using Application.Features.Validation.Commands.ExecuteDgiiValidation;
using Application.Features.Validation.Commands.GenerateAlerta;
using Application.Features.Validation.Queries.GetActiveAlertsByProject;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/proyectos/{proyectoId:guid}/validacion")]
[Authorize]
public class ValidationController : ControllerBase
{
    private readonly ExecuteDgiiValidationCommandHandler _executeDgiiValidationHandler;
    private readonly ExecuteAyuntamientoValidationCommandHandler _executeAyuntamientoValidationHandler;
    private readonly CheckDuplicateExpedienteCommandHandler _checkDuplicateExpedienteHandler;
    private readonly EvaluateDocumentFormalityCommandHandler _evaluateDocumentFormalityHandler;
    private readonly GenerateAlertaCommandHandler _generateAlertaHandler;
    private readonly GetActiveAlertsByProjectQueryHandler _getActiveAlertsHandler;

    public ValidationController(
        ExecuteDgiiValidationCommandHandler executeDgiiValidationHandler,
        ExecuteAyuntamientoValidationCommandHandler executeAyuntamientoValidationHandler,
        CheckDuplicateExpedienteCommandHandler checkDuplicateExpedienteHandler,
        EvaluateDocumentFormalityCommandHandler evaluateDocumentFormalityHandler,
        GenerateAlertaCommandHandler generateAlertaHandler,
        GetActiveAlertsByProjectQueryHandler getActiveAlertsHandler)
    {
        _executeDgiiValidationHandler = executeDgiiValidationHandler;
        _executeAyuntamientoValidationHandler = executeAyuntamientoValidationHandler;
        _checkDuplicateExpedienteHandler = checkDuplicateExpedienteHandler;
        _evaluateDocumentFormalityHandler = evaluateDocumentFormalityHandler;
        _generateAlertaHandler = generateAlertaHandler;
        _getActiveAlertsHandler = getActiveAlertsHandler;
    }

    [HttpPost("dgii")]
    public async Task<IActionResult> ExecuteDgiiValidation(Guid proyectoId, CancellationToken ct)
    {
        var userId = Guid.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? Guid.Empty.ToString());
        var command = new ExecuteDgiiValidationCommand { ProyectoId = proyectoId, UsuarioId = userId };
        var result = await _executeDgiiValidationHandler.Handle(command, ct);
        return Ok(result);
    }

    [HttpPost("ayuntamiento")]
    public async Task<IActionResult> ExecuteAyuntamientoValidation(Guid proyectoId, CancellationToken ct)
    {
        var userId = Guid.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? Guid.Empty.ToString());
        var command = new ExecuteAyuntamientoValidationCommand { ProyectoId = proyectoId, UsuarioId = userId };
        var result = await _executeAyuntamientoValidationHandler.Handle(command, ct);
        return Ok(result);
    }

    [HttpPost("duplicidad")]
    public async Task<IActionResult> CheckDuplicateExpediente(Guid proyectoId, CancellationToken ct)
    {
        var userId = Guid.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? Guid.Empty.ToString());
        var command = new CheckDuplicateExpedienteCommand { ProyectoId = proyectoId, UsuarioId = userId };
        var result = await _checkDuplicateExpedienteHandler.Handle(command, ct);
        return Ok(result);
    }

    [HttpPost("formalidad-documentos")]
    public async Task<IActionResult> EvaluateDocumentFormality(Guid proyectoId, CancellationToken ct)
    {
        var userId = Guid.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? Guid.Empty.ToString());
        var command = new EvaluateDocumentFormalityCommand { ProyectoId = proyectoId, UsuarioId = userId };
        var result = await _evaluateDocumentFormalityHandler.Handle(command, ct);
        return Ok(result);
    }

    [HttpPost("alertas")]
    public async Task<IActionResult> GenerateAlerta(Guid proyectoId, [FromBody] GenerateAlertaCommand command, CancellationToken ct)
    {
        var userId = Guid.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? Guid.Empty.ToString());
        command.ProyectoId = proyectoId;
        command.UsuarioId = userId;
        var result = await _generateAlertaHandler.Handle(command, ct);
        return Ok(result);
    }

    [HttpGet("alertas")]
    public async Task<IActionResult> GetActiveAlerts(Guid proyectoId, CancellationToken ct)
    {
        var query = new GetActiveAlertsByProjectQuery { ProyectoId = proyectoId };
        var result = await _getActiveAlertsHandler.Handle(query, ct);
        return Ok(result);
    }
}
