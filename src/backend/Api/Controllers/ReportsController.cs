namespace Api.Controllers;

using System;
using System.Threading;
using System.Threading.Tasks;
using Application.Features.Reports.Queries.GetProjectReports;
using Application.Features.Reports.Queries.GetPublicProjectReport;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/projects/{projectId}/reports")]
public class ReportsController : ControllerBase
{
    private readonly GetProjectReportsQueryHandler _getHandler;
    private readonly GetPublicProjectReportQueryHandler _publicHandler;

    public ReportsController(GetProjectReportsQueryHandler getHandler, GetPublicProjectReportQueryHandler publicHandler)
    {
        _getHandler = getHandler;
        _publicHandler = publicHandler;
    }

    [HttpGet]
    public async Task<IActionResult> GetReports(Guid projectId, CancellationToken cancellationToken)
    {
        var result = await _getHandler.HandleAsync(projectId, cancellationToken);
        return Ok(result);
    }

    [HttpGet("public")]
    [AllowAnonymous]
    public async Task<IActionResult> GetPublicReport(Guid projectId, CancellationToken cancellationToken)
    {
        var result = await _publicHandler.HandleAsync(projectId, cancellationToken);
        if (result == null)
            return NotFound();
            
        return Ok(result);
    }
}
