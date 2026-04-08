namespace Api.Controllers;

using System;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Validation;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/projects/{projectId}/validations/internal")]
public class InternalValidationsController : ControllerBase
{
    private readonly IInternalValidationEngine _validationEngine;

    public InternalValidationsController(IInternalValidationEngine validationEngine)
    {
        _validationEngine = validationEngine;
    }

    [HttpPost("run")]
    public async Task<IActionResult> RunValidation(Guid projectId, CancellationToken cancellationToken)
    {
        try
        {
            var result = await _validationEngine.RunValidationAsync(projectId, cancellationToken);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [HttpGet("latest")]
    public async Task<IActionResult> GetLatestValidation(Guid projectId, CancellationToken cancellationToken)
    {
        var result = await _validationEngine.GetLatestValidationAsync(projectId, cancellationToken);
        if (result == null)
            return NotFound("No se encontraron validaciones internas para este proyecto.");

        return Ok(result);
    }
}
