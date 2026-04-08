namespace Api.Controllers;

using System;
using System.Threading;
using System.Threading.Tasks;
using Application.Features.Reports.Queries.GetProjectReports;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/projects/{projectId}/reports")]
public class ReportsController : ControllerBase
{
    private readonly GetProjectReportsQueryHandler _getHandler;

    public ReportsController(GetProjectReportsQueryHandler getHandler)
    {
        _getHandler = getHandler;
    }

    [HttpGet]
    public async Task<IActionResult> GetReports(Guid projectId, CancellationToken cancellationToken)
    {
        var result = await _getHandler.HandleAsync(projectId, cancellationToken);
        return Ok(result);
    }
}
