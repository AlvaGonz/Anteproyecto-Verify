namespace Api.Controllers;

using System;
using System.Threading;
using System.Threading.Tasks;
using Application.Features.Audit.Queries.GetProjectAuditTrail;
using Application.Features.Audit.Queries.ExportAuditTrail;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/projects/{projectId}/audit")]
public class AuditController : ControllerBase
{
    private readonly GetProjectAuditTrailQueryHandler _getHandler;
    private readonly ExportAuditTrailQueryHandler _exportHandler;

    public AuditController(
        GetProjectAuditTrailQueryHandler getHandler,
        ExportAuditTrailQueryHandler exportHandler)
    {
        _getHandler = getHandler;
        _exportHandler = exportHandler;
    }

    [HttpGet]
    public async Task<IActionResult> GetAuditTrail(
        Guid projectId, 
        [FromQuery] string? tipoEvento,
        [FromQuery] DateTime? fromDate,
        [FromQuery] DateTime? toDate,
        CancellationToken cancellationToken)
    {
        var result = await _getHandler.HandleAsync(projectId, tipoEvento, fromDate, toDate, cancellationToken);
        return Ok(result);
    }

    [HttpGet("export")]
    public async Task<IActionResult> ExportAuditTrail(Guid projectId, CancellationToken cancellationToken)
    {
        var csvBytes = await _exportHandler.HandleAsync(projectId, cancellationToken);
        return File(csvBytes, "text/csv", $"audit_trail_{projectId}_{DateTime.UtcNow:yyyyMMddHHmmss}.csv");
    }
}
