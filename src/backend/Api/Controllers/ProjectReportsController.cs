namespace Api.Controllers;

using System;
using System.Threading;
using System.Threading.Tasks;
using Application.Features.Reportes.Commands.GenerateExcelReport;
using Application.Features.Reportes.Commands.GeneratePdfReport;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/projects/{projectId}/reports")]
[Authorize]
public class ProjectReportsController : ControllerBase
{
    private readonly GeneratePdfReportCommandHandler _pdfHandler;
    private readonly GenerateExcelReportCommandHandler _excelHandler;

    public ProjectReportsController(
        GeneratePdfReportCommandHandler pdfHandler,
        GenerateExcelReportCommandHandler excelHandler)
    {
        _pdfHandler = pdfHandler;
        _excelHandler = excelHandler;
    }

    [HttpPost("pdf")]
    public async Task<IActionResult> GeneratePdf(Guid projectId, CancellationToken ct)
    {
        var command = new GeneratePdfReportCommand
        {
            ProjectId = projectId,
            UsuarioId = GetUserId(),
            IpOrigen = HttpContext.Connection.RemoteIpAddress?.ToString(),
            UserAgent = Request.Headers["User-Agent"].ToString()
        };

        var result = await _pdfHandler.Handle(command, ct);
        if (result == null)
        {
            return UnprocessableEntity(new { Mensaje = "No se pudo generar el reporte PDF. Verifique que el proyecto exista y tenga validaciones." });
        }

        return File(result.Content, result.ContentType, result.FileName);
    }

    [HttpPost("excel")]
    public async Task<IActionResult> GenerateExcel(Guid projectId, CancellationToken ct)
    {
        var command = new GenerateExcelReportCommand
        {
            ProjectId = projectId,
            UsuarioId = GetUserId(),
            IpOrigen = HttpContext.Connection.RemoteIpAddress?.ToString(),
            UserAgent = Request.Headers["User-Agent"].ToString()
        };

        var result = await _excelHandler.Handle(command, ct);
        if (result == null)
        {
            return UnprocessableEntity(new { Mensaje = "No se pudo generar el reporte Excel. Verifique que el proyecto exista y tenga validaciones." });
        }

        return File(result.Content, result.ContentType, result.FileName);
    }

    private Guid? GetUserId()
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(userIdClaim, out var userId) ? userId : null;
    }
}
