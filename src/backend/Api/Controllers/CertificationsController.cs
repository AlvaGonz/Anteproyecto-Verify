namespace Api.Controllers;

using System;
using System.Threading;
using System.Threading.Tasks;
using Application.Features.Certifications.Commands.IssueCertification;
using Application.Features.Certifications.Queries.GetProjectCertification;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/projects/{projectId}/certifications")]
public class CertificationsController : ControllerBase
{
    private readonly IssueCertificationCommandHandler _issueHandler;
    private readonly GetProjectCertificationQueryHandler _getHandler;

    public CertificationsController(
        IssueCertificationCommandHandler issueHandler,
        GetProjectCertificationQueryHandler getHandler)
    {
        _issueHandler = issueHandler;
        _getHandler = getHandler;
    }

    [HttpPost]
    public async Task<IActionResult> IssueCertification(Guid projectId, CancellationToken cancellationToken)
    {
        try
        {
            // En un caso real, el userId vendría del token JWT
            var userId = Guid.NewGuid(); 
            var result = await _issueHandler.HandleAsync(projectId, userId, cancellationToken);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error interno al emitir certificación: {ex.Message}");
        }
    }

    [HttpGet("current")]
    public async Task<IActionResult> GetCurrentCertification(Guid projectId, CancellationToken cancellationToken)
    {
        var result = await _getHandler.HandleAsync(projectId, cancellationToken);
        if (result == null)
        {
            return NotFound("No se encontró una certificación vigente para este proyecto.");
        }
        return Ok(result);
    }
}
