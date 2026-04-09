namespace Api.Controllers;

using System;
using System.Threading;
using System.Threading.Tasks;
using Application.Features.Reports.Queries.GenerarReporteHallazgos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/proyectos/{proyectoId:guid}/reporte-hallazgos")]
[Authorize]
public class ReporteHallazgosController : ControllerBase
{
    private readonly GenerarReporteHallazgosQueryHandler _generarReporteHandler;

    public ReporteHallazgosController(GenerarReporteHallazgosQueryHandler generarReporteHandler)
    {
        _generarReporteHandler = generarReporteHandler;
    }

    [HttpGet]
    public async Task<IActionResult> ObtenerReporte(Guid proyectoId, CancellationToken ct)
    {
        var query = new GenerarReporteHallazgosQuery { ProyectoId = proyectoId };
        var result = await _generarReporteHandler.Handle(query, ct);
        return Ok(result);
    }
}
