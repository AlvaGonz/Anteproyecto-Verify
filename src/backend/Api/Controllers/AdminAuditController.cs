namespace Api.Controllers;

using System;
using System.Threading;
using System.Threading.Tasks;
using Application.Features.Audit.Queries.GetGlobalAuditTrail;
using Application.Features.Audit.Queries.ExportGlobalAuditTrail;
using Microsoft.AspNetCore.Mvc;

[ApiController]
public class AdminAuditController : ControllerBase
{
    private readonly GetGlobalAuditTrailQueryHandler _getHandler;
    private readonly ExportGlobalAuditTrailQueryHandler _exportHandler;

    public AdminAuditController(
        GetGlobalAuditTrailQueryHandler getHandler,
        ExportGlobalAuditTrailQueryHandler exportHandler)
    {
        _getHandler = getHandler;
        _exportHandler = exportHandler;
    }

    [HttpGet("api/admin/audit")]
    public async Task<IActionResult> GetGlobalAuditTrail(
        [FromQuery] string? tipoEvento,
        [FromQuery] DateTime? fromDate,
        [FromQuery] DateTime? toDate,
        CancellationToken cancellationToken)
    {
        var result = await _getHandler.HandleAsync(tipoEvento, fromDate, toDate, cancellationToken);
        return Ok(result);
    }

    [HttpGet("api/reports/global-audit")]
    public async Task<IActionResult> ExportGlobalAuditTrail(CancellationToken cancellationToken)
    {
        var csvBytes = await _exportHandler.HandleAsync(cancellationToken);
        return File(csvBytes, "text/csv", $"global_audit_trail_{DateTime.UtcNow:yyyyMMddHHmmss}.csv");
    }
}
