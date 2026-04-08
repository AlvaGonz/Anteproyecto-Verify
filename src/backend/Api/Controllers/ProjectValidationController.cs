namespace Api.Controllers;

using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Application.Services.Validation;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/projects/{projectId}/validate")]
public class ProjectValidationController : ControllerBase
{
    private readonly IProjectValidationOrchestrator _orchestrator;

    public ProjectValidationController(IProjectValidationOrchestrator orchestrator)
    {
        _orchestrator = orchestrator;
    }

    [HttpPost]
    public async Task<IActionResult> RunValidation(Guid projectId, CancellationToken cancellationToken)
    {
        try
        {
            // En un caso real, el userId vendría del token JWT (User.Identity.Name o similar)
            var userId = Guid.NewGuid(); // Mock user ID por ahora
            var result = await _orchestrator.RunFullValidationAsync(projectId, userId, cancellationToken);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error interno durante la orquestación: {ex.Message}");
        }
    }

    [HttpGet]
    [Route("../validation-result")]
    public async Task<IActionResult> GetValidationResult(Guid projectId, CancellationToken cancellationToken)
    {
        var result = await _orchestrator.GetLatestValidationResultAsync(projectId, cancellationToken);
        if (result == null)
        {
            return NotFound("No se encontraron resultados de validación para este proyecto.");
        }

        return Ok(result);
    }
}
