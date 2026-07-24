namespace Api.Controllers;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Persistence;
using Application.Contracts.Projects;
using Application.Contracts.Documents;
using Application.DTOs;
using Application.DTOs.Projects;
using Domain.Entities;
using Domain.Enums;
using Domain.Policies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Application.Common.Exceptions;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Application.Abstractions.Storage;
using Infrastructure.Persistence;


[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProjectsController : ControllerBase
{
    private readonly IProjectService _projectService;
    private readonly IUsuarioRepository _usuarioRepository;
    private readonly IBlobStorageService _blobStorageService;
    private readonly IDocumentService _documentService;
    private readonly AppDbContext _dbContext;

    public ProjectsController(
        IProjectService projectService,
        IUsuarioRepository usuarioRepository,
        IBlobStorageService blobStorageService,
        IDocumentService documentService,
        AppDbContext dbContext)
    {
        _projectService = projectService;
        _usuarioRepository = usuarioRepository;
        _blobStorageService = blobStorageService;
        _documentService = documentService;
        _dbContext = dbContext;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<ProyectoDto>>> GetProjects(CancellationToken cancellationToken)
    {
        if (User.Identity?.IsAuthenticated == true)
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
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
                    
                    // Log the consulta for authenticated users viewing project list
                    var log = new LogConsulta(userId, true, "Consulta lista de proyectos");
                    _dbContext.LogConsultas.Add(log);
                    await _dbContext.SaveChangesAsync(cancellationToken);
                    
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

        // Log the consulta for authenticated users viewing public projects
        if (User.Identity?.IsAuthenticated == true)
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
            if (Guid.TryParse(userIdClaim, out var userId))
            {
                var log = new LogConsulta(userId, true, $"Consulta pública proyecto: {project.CodigoInterno}");
                _dbContext.LogConsultas.Add(log);
                await _dbContext.SaveChangesAsync(cancellationToken);
            }
        }

        return Ok(project);
    }

    [HttpGet("{id:guid}/status-eligibility")]
    [AllowAnonymous]
    public async Task<IActionResult> GetStatusEligibility(Guid id, CancellationToken cancellationToken)
    {
        var project = await _projectService.GetProjectByIdAsync(id, cancellationToken);
        if (project == null) return NotFound();

        // Count documents and check for observaciones via the document service
        // We query the document table directly through the document service
        var documents = await _documentService.GetProjectDocumentsAsync(id, cancellationToken);
        var docList = documents.ToList();
        var hasObservaciones = docList.Any(d => !string.IsNullOrEmpty(d.Observaciones));

        // Sync: projects that already have documents but stayed on CREADO/EDITADO
        // (e.g. docs uploaded before auto-promotion existed) enter REVISION here.
        var currentStatus = project.EstadoProyecto;
        if (ProjectLifecyclePolicy.ShouldEnterReview(currentStatus, docList.Count))
        {
            project = await _projectService.UpdateProjectStatusAsync(id, ProjectStatus.Revision, cancellationToken);
            currentStatus = project.EstadoProyecto;
        }

        return Ok(new
        {
            documentCount = docList.Count,
            hasObservaciones,
            currentStatus
        });
    }

    [HttpPost]
    [AllowAnonymous]
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
    [AllowAnonymous]
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
    [AllowAnonymous]
    // [Authorize] // TODO: Enable when auth is fully implemented
    public async Task<ActionResult<ProyectoDto>> UpdateProjectStatus(Guid id, [FromBody] string statusCode, CancellationToken cancellationToken)
    {
        if (!ProjectStatusCodes.TryParseCodigoUnico(statusCode, out var status))
        {
            return BadRequest(new { message = $"Estado inválido: '{statusCode}'. Use CREADO, EDITADO, REVISION, OBSERVACION o PUBLICADO." });
        }

        try
        {
            var project = await _projectService.UpdateProjectStatusAsync(id, status, cancellationToken);
            return Ok(project);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
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

    [HttpDelete("{id:guid}")]
    [AllowAnonymous]
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

    [HttpPost("upload-image")]
    [AllowAnonymous]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UploadImage([FromForm] IFormFile file, CancellationToken cancellationToken)
    {
        if (file == null || file.Length == 0)
            return BadRequest("El archivo es requerido y no puede estar vacío.");

        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
        var extension = System.IO.Path.GetExtension(file.FileName).ToLowerInvariant();
        if (Array.IndexOf(allowedExtensions, extension) < 0)
            return BadRequest("Tipo de archivo no permitido (solo JPEG, PNG y WebP).");

        if (file.Length > 5 * 1024 * 1024) // 5MB limit
            return BadRequest("El archivo excede el tamaño máximo permitido (5MB).");

        using var stream = file.OpenReadStream();
        var blobName = $"project-images/{Guid.NewGuid()}{extension}";

        try
        {
            var uploadResult = await _blobStorageService.UploadAsync(stream, blobName, file.ContentType, cancellationToken);
            return Ok(new { url = uploadResult.Url });
        }
        catch (Exception ex)
        {
            return BadRequest($"Error al subir la imagen: {ex.Message}");
        }
    }

    [HttpPost("{id:guid}/interest")]
    public async Task<IActionResult> InteresarProyecto(Guid id, CancellationToken cancellationToken)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        if (!Guid.TryParse(userIdString, out var userId)) return Unauthorized();

        try
        {
            await _projectService.InteresarProyectoAsync(id, userId, cancellationToken);
            return Ok(new { message = "Interés registrado exitosamente." });
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (BadRequestException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{id:guid}/save")]
    public async Task<IActionResult> GuardarProyecto(Guid id, CancellationToken cancellationToken)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        if (!Guid.TryParse(userIdString, out var userId)) return Unauthorized();

        try
        {
            await _projectService.GuardarProyectoAsync(id, userId, cancellationToken);
            return Ok(new { message = "Proyecto guardado." });
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpDelete("{id:guid}/save")]
    public async Task<IActionResult> QuitarGuardadoProyecto(Guid id, CancellationToken cancellationToken)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        if (!Guid.TryParse(userIdString, out var userId)) return Unauthorized();

        await _projectService.QuitarGuardadoProyectoAsync(id, userId, cancellationToken);
        return NoContent();
    }

    [HttpGet("interests")]
    public async Task<IActionResult> GetIntereses(CancellationToken cancellationToken)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        if (!Guid.TryParse(userIdString, out var userId)) return Unauthorized();

        var intereses = await _projectService.GetProyectosInteresesAsync(userId, cancellationToken);
        return Ok(intereses);
    }

    [HttpGet("saved")]
    public async Task<IActionResult> GetGuardados(CancellationToken cancellationToken)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        if (!Guid.TryParse(userIdString, out var userId)) return Unauthorized();

        var guardados = await _projectService.GetProyectosGuardadosAsync(userId, cancellationToken);
        return Ok(guardados);
    }
}
