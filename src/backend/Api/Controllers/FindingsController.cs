namespace Api.Controllers;

using System;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Persistence;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
using Application.DTOs.Findings;

[ApiController]
[Route("api/projects/{projectId}/findings")]
public class FindingsController : ControllerBase
{
    private readonly IHallazgoRepository _hallazgoRepository;

    public FindingsController(IHallazgoRepository hallazgoRepository)
    {
        _hallazgoRepository = hallazgoRepository;
    }

    [HttpGet]
    public async Task<IActionResult> GetProjectFindings(Guid projectId, CancellationToken cancellationToken)
    {
        var findings = await _hallazgoRepository.GetByProyectoIdAsync(projectId, cancellationToken);
        var dtos = findings.Select(f => new FindingDto(
            f.Id,
            f.ProyectoId,
            f.ValidacionId,
            f.Severidad,
            f.Codigo,
            f.Titulo,
            f.Descripcion,
            f.Recomendacion,
            f.Resuelto,
            f.CreatedAtUtc
        ));

        return Ok(dtos);
    }
}
