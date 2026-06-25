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

[ApiController]
[Route("api/[controller]")]
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
        Domain.Entities.Usuario? loggedInUser = null;
        var token = Request.Cookies["vf_token"];
        if (!string.IsNullOrEmpty(token))
        {
            try
            {
                var userEmail = System.Text.Encoding.UTF8.GetString(Convert.FromBase64String(token));
                loggedInUser = await _usuarioRepository.GetByEmailAsync(userEmail, cancellationToken);
            }
            catch { }
        }

        if (loggedInUser != null)
        {
            var projects = await _projectService.GetAllProjectsAsync(cancellationToken);
            if (loggedInUser.Rol != UserRole.Administrator)
            {
                projects = projects.Where(p => p.UsuarioCreadorId == loggedInUser.Id);
            }
            return Ok(projects);
        }

        var showAll = User.Identity?.IsAuthenticated == true || Request.Headers.ContainsKey("Authorization");
        if (showAll)
        {
            var projects = await _projectService.GetAllProjectsAsync(cancellationToken);
            return Ok(projects);
        }
        else
        {
            var projects = await _projectService.GetVisibleProjectsAsync(cancellationToken);
            return Ok(projects);
        }
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
