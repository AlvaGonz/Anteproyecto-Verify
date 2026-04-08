namespace Api.Controllers;

using System;
using System.Threading;
using System.Threading.Tasks;
using Application.Features.Reports.Queries.GetPublicProjectReport;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/public/projects/{projectId}/report")]
public class PublicReportsController : ControllerBase
{
    private readonly GetPublicProjectReportQueryHandler _getHandler;

    public PublicReportsController(GetPublicProjectReportQueryHandler getHandler)
    {
        _getHandler = getHandler;
    }

    [HttpGet]
    public async Task<IActionResult> GetPublicReport(Guid projectId, CancellationToken cancellationToken)
    {
        var result = await _getHandler.HandleAsync(projectId, cancellationToken);
        if (result == null)
        {
            return NotFound(new { Message = "Reporte público no encontrado para este proyecto." });
        }
        return Ok(result);
    }
}
