namespace Api.Controllers;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Persistence;
using Application.Contracts.Projects;
using Application.DTOs;
using Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Application.Common.Exceptions;
using System.Security.Claims;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProjectsController : ControllerBase
{
    private readonly IProjectService _projectService;
    private readonly IUsuarioRepository _usuarioRepository;

    public ProjectsController(IProjectService projectService, IUsuarioRepository usuarioRepository)
    {
        _projectService = projectService;
        _usuarioRepository = usuarioRepository;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<ProyectoDto>>> GetProjects(CancellationToken cancellationToken)
    {
        if (User.Identity?.IsAuthenticated == true)
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (Guid.TryParse(userIdClaim, out var userId))
            {
                var loggedInUser = await _usuarioRepository.GetByIdAsync(userId, cancellationToken);
                if (loggedInUser != null)
                {
                    var projects = await _projectService.GetAllProjectsAsync(cancellationToken);
                    if (loggedInUser.Rol != UserRole.Administrator)
                    {
                        projects = projects.Where(p => p.UsuarioCreadorId == userId);
                    }
                    return Ok(projects);
                }
            }
        }

        var visibleProjects = await _projectService.GetVisibleProjectsAsync(cancellationToken);
        return Ok(visibleProjects);
    }

    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    public async Task<ActionResult<ProyectoDto>> GetProjectById(Guid id, CancellationToken cancellationToken)
    {
        var project = await _projectService.GetProjectByIdAsync(id, cancellationToken);
        if (project == null)
        {
            return NotFound();
        }
        return Ok(project);
    }

    [HttpPost]
    // [Authorize] // TODO: Enable when auth is fully implemented
    public async Task<ActionResult<ProyectoDto>> CreateProject([FromBody] CreateProyectoDto dto, CancellationToken cancellationToken)
    {
        try
        {
            var project = await _projectService.CreateProjectAsync(dto, cancellationToken);
            return CreatedAtAction(nameof(GetProjectById), new { id = project.Id }, project);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message, field = ex.ParamName });
        }
        catch (QuotaExceededException ex)
        {
            return StatusCode(402, new { 
                error = "QUOTA_EXCEEDED", 
                tier = ex.TierName, 
                message = ex.Message 
            });
        }
    }

    [HttpPut("{id:guid}")]
    // [Authorize] // TODO: Enable when auth is fully implemented
    public async Task<ActionResult<ProyectoDto>> UpdateProject(Guid id, [FromBody] UpdateProyectoDto dto, CancellationToken cancellationToken)
    {
        try
        {
            var project = await _projectService.UpdateProjectAsync(id, dto, cancellationToken);
            return Ok(project);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPatch("{id:guid}/status")]
    // [Authorize] // TODO: Enable when auth is fully implemented
    public async Task<ActionResult<ProyectoDto>> UpdateProjectStatus(Guid id, [FromBody] ProjectStatus status, CancellationToken cancellationToken)
    {
        try
        {
            var project = await _projectService.UpdateProjectStatusAsync(id, status, cancellationToken);
            return Ok(project);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpDelete("{id:guid}")]
    // [Authorize] // TODO: Enable when auth is fully implemented
    public async Task<IActionResult> DeleteProject(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            await _projectService.DeleteProjectAsync(id, cancellationToken);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }
}
