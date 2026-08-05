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
using Application.DTOs.Common;
using Application.DTOs.Projects;
using Domain.Entities;
using Domain.Enums;
using Domain.Policies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Application.Common.Exceptions;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Application.Abstractions.Storage;
using Infrastructure.Persistence;
using MediatR;
using Application.Features.Projects.Queries.GetCategorias;

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
    private readonly IMediator _mediator;

    public ProjectsController(
        IProjectService projectService,
        IUsuarioRepository usuarioRepository,
        IBlobStorageService blobStorageService,
        IDocumentService documentService,
        AppDbContext dbContext,
        IMediator mediator)
    {
        _projectService = projectService;
        _usuarioRepository = usuarioRepository;
        _blobStorageService = blobStorageService;
        _documentService = documentService;
        _dbContext = dbContext;
        _mediator = mediator;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<PaginatedResult<ProyectoDto>>> GetProjects(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        [FromQuery] string? q = null,
        [FromQuery] string? estados = null,
        CancellationToken cancellationToken = default)
    {
        if (User.Identity?.IsAuthenticated == true)
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
            if (Guid.TryParse(userIdClaim, out var userId))
            {
                var loggedInUser = await _usuarioRepository.GetByIdAsync(userId, cancellationToken);
                if (loggedInUser != null)
                {
                    Guid? filterUserId = loggedInUser.Rol != UserRole.Administrator ? userId : null;
                    var result = await _projectService.GetAllProjectsWithCountAsync(filterUserId, page, pageSize, q, estados, cancellationToken);
                    
                    return Ok(result);
                }
            }
        }

        var visibleResult = await _projectService.GetVisibleProjectsWithCountAsync(page, pageSize, cancellationToken);
        return Ok(visibleResult);
    }

    [HttpGet("categories")]
    [AllowAnonymous]
    public async Task<ActionResult<List<CategoriaProyectoDto>>> GetCategories(CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetCategoriasQuery(), cancellationToken);
        return Ok(result);
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

    public class ConsumeQuotaRequest
    {
        public Guid? ProjectId { get; set; }
        public string? Codigo { get; set; }
        public string? Detalle { get; set; }
    }

    [HttpPost("consume-quota")]
    public async Task<ActionResult> ConsumeQuota([FromBody] ConsumeQuotaRequest request, CancellationToken cancellationToken)
    {
        if (User.Identity?.IsAuthenticated != true)
        {
            return Ok(); // Anonymous users don't consume quota
        }

        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        if (!Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        var user = await _usuarioRepository.GetByIdWithPlanAsync(userId, cancellationToken);
        if (user == null) return Unauthorized();

        string logDetail = request.Detalle ?? "Consulta de proyecto";
        Guid? ownerId = null;

        if (request.ProjectId.HasValue)
        {
            var project = await _dbContext.Proyectos.FindAsync(new object[] { request.ProjectId.Value }, cancellationToken);
            if (project != null)
            {
                ownerId = project.UsuarioCreadorId;
                logDetail = $"Consulta pública proyecto: {project.CodigoInterno}";
            }
        }
        else if (!string.IsNullOrEmpty(request.Codigo))
        {
            logDetail = $"Consulta código: {request.Codigo}";
        }

        bool isOwnerOrTeam = false;
        if (ownerId.HasValue)
        {
            isOwnerOrTeam = user.Id == ownerId.Value || 
                            (user.TitularId.HasValue && user.TitularId.Value == ownerId.Value) ||
                            (user.MiembrosEquipo != null && user.MiembrosEquipo.Any(m => m.Id == ownerId.Value));
        }

        if (!isOwnerOrTeam && user.Rol != Domain.Enums.UserRole.Administrator)
        {
            var plan = SubscriptionTierPolicy.GetEffectivePlan(user);
            if (plan == null)
            {
                return Ok(new
                {
                    allowed = false,
                    error = "QUOTA_EXCEEDED",
                    limitType = "MaxConsultas",
                    used = user.ConsultasUsadas,
                    max = 0,
                    message = "No tienes un plan activo. Adquiere una suscripción para consultar proyectos."
                });
            }

            if (!plan.HasConsultasDisponibles(user.ConsultasUsadas))
            {
                return Ok(new
                {
                    allowed = false,
                    error = "QUOTA_EXCEEDED",
                    limitType = "MaxConsultas",
                    used = user.ConsultasUsadas,
                    max = plan.MaxConsultas,
                    message = "Has alcanzado el límite de consultas de tu plan actual. Mejora tu plan para continuar consultando proyectos."
                });
            }

            // Atomic increment + log in a single transaction
            using var tx = await _dbContext.Database.BeginTransactionAsync(cancellationToken);

            user.IncrementarConsulta();
            var log = new LogConsulta(userId, true, logDetail);
            _dbContext.LogConsultas.Add(log);
            await _dbContext.SaveChangesAsync(cancellationToken);

            await tx.CommitAsync(cancellationToken);
        }

        return Ok(new { allowed = true });
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

    [HttpGet("{id:guid}/status-history")]
    [AllowAnonymous]
    public async Task<ActionResult> GetStatusHistory(Guid id, CancellationToken cancellationToken)
    {
        var entries = await _dbContext.Auditorias
            .Where(a => a.ProyectoId == id && a.TipoOperacion == TipoOperacion.CambioEstado)
            .OrderByDescending(a => a.FechaEventoUtc)
            .Select(a => new
            {
                id = a.Id,
                proyectoId = a.ProyectoId,
                estadoAnteriorId = a.EstadoAnteriorId,
                estadoAnteriorNombre = a.EstadoAnterior != null ? a.EstadoAnterior.Nombre : null,
                estadoNuevoId = a.EstadoNuevoId,
                estadoNuevoNombre = a.EstadoNuevo != null ? a.EstadoNuevo.Nombre : null,
                usuarioId = a.UsuarioId,
                usuarioNombre = a.Usuario != null ? a.Usuario.Nombre + " " + a.Usuario.Apellido : null,
                fechaCambioUtc = a.FechaEventoUtc
            })
            .ToListAsync(cancellationToken);

        return Ok(entries);
    }

    [HttpDelete("{id:guid}")]
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

    [HttpDelete("{id:guid}/interest")]
    public async Task<IActionResult> QuitarInteresProyecto(Guid id, CancellationToken cancellationToken)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        if (!Guid.TryParse(userIdString, out var userId)) return Unauthorized();

        await _projectService.QuitarInteresProyectoAsync(id, userId, cancellationToken);
        return NoContent();
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

    [HttpGet("interests/export")]
    public async Task<IActionResult> ExportIntereses([FromQuery] string type, CancellationToken cancellationToken)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        if (!Guid.TryParse(userIdString, out var userId)) return Unauthorized();

        var intereses = await _projectService.GetProyectosInteresesAsync(userId, cancellationToken);
        var list = intereses.ToList();

        var userObj = await _dbContext.Set<Usuario>().FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);
        var userName = userObj?.NombreCompleto ?? "Usuario";

        if (type == "Interesados")
        {
            list = list.Where(x => x.Tipo == "Interesados").ToList();
        }
        else if (type == "Mis Intereses")
        {
            list = list.Where(x => x.Tipo == "Mis Intereses").ToList();
        }

        string templateFileName = type == "Interesados"
            ? "Reporte solicitudes de interes.xlsx"
            : "Reporte proyecto de interes.xlsx";

        string basePath = "/src";
        string templatePath = System.IO.Path.Combine(basePath, templateFileName);
        if (!System.IO.File.Exists(templatePath))
        {
            templatePath = System.IO.Path.Combine(System.IO.Directory.GetCurrentDirectory(), templateFileName);
        }

        if (!System.IO.File.Exists(templatePath))
        {
            return NotFound("Plantilla de reporte no encontrada.");
        }

        using var workbook = new ClosedXML.Excel.XLWorkbook(templatePath);
        var worksheet = workbook.Worksheet(1);

        string titleText = "";
        if (type == "Todos")
        {
            titleText = "Reporte de Solicitud de interesado y mis interes";
        }
        else if (type == "Interesados")
        {
            titleText = "Reporte de Solicitud de interesado";
        }
        else
        {
            titleText = "Reporte de mis interes";
        }
        worksheet.Cell("E2").Value = titleText;

        if (type == "Todos")
        {
            worksheet.Cell("H4").Value = "Nombre de usuario (Publica/Interesado)";
        }

        int startRow = 5;
        for (int i = 0; i < list.Count; i++)
        {
            var item = list[i];
            int currentRow = startRow + i;

            worksheet.Cell(currentRow, 3).Value = i + 1; // No.
            worksheet.Cell(currentRow, 4).Value = userName; // Usuario
            worksheet.Cell(currentRow, 5).Value = item.NombreProyecto;
            worksheet.Cell(currentRow, 6).Value = item.Provincia;
            worksheet.Cell(currentRow, 7).Value = item.Fecha.ToString("dd/MM/yyyy HH:mm");

            string displayUser = item.NombreUsuario;
            if (type == "Todos")
            {
                displayUser = $"[{item.Tipo}] {displayUser}";
            }
            worksheet.Cell(currentRow, 8).Value = displayUser;

            worksheet.Cell(currentRow, 9).Value = item.Rnc;
            worksheet.Cell(currentRow, 10).Value = item.Direccion;
            worksheet.Cell(currentRow, 11).Value = item.Telefono;
            worksheet.Cell(currentRow, 12).Value = item.Email;

            // Apply font to match template
            for (int col = 3; col <= 12; col++)
            {
                var cell = worksheet.Cell(currentRow, col);
                cell.Style.Font.FontName = "Aptos Narrow";
                cell.Style.Font.FontSize = 11;
                cell.Style.Border.BottomBorder = ClosedXML.Excel.XLBorderStyleValues.Thin;
                cell.Style.Border.BottomBorderColor = ClosedXML.Excel.XLColor.FromHtml("#E8E8E8");
                cell.Style.Border.TopBorder = ClosedXML.Excel.XLBorderStyleValues.Thin;
                cell.Style.Border.TopBorderColor = ClosedXML.Excel.XLColor.FromHtml("#E8E8E8");
                cell.Style.Border.LeftBorder = ClosedXML.Excel.XLBorderStyleValues.Thin;
                cell.Style.Border.LeftBorderColor = ClosedXML.Excel.XLColor.FromHtml("#E8E8E8");
                cell.Style.Border.RightBorder = ClosedXML.Excel.XLBorderStyleValues.Thin;
                cell.Style.Border.RightBorderColor = ClosedXML.Excel.XLColor.FromHtml("#E8E8E8");
            }
        }

        using var stream = new System.IO.MemoryStream();
        workbook.SaveAs(stream);
        var content = stream.ToArray();

        var now = DateTime.Now;
        string fileTypeLabel = type == "Todos" ? "Todos" : (type == "Interesados" ? "Interesados" : "Mis_Intereses");
        string filename = $"Reporte_{fileTypeLabel}_{now.Day}-{now.Month}-{now.Year} {now.Hour}_{now.Minute}.xlsx";

        return File(content, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", filename);
    }

    [HttpGet("saved")]
    public async Task<IActionResult> GetGuardados(CancellationToken cancellationToken)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        if (!Guid.TryParse(userIdString, out var userId)) return Unauthorized();

        var guardados = await _projectService.GetProyectosGuardadosAsync(userId, cancellationToken);
        return Ok(guardados);
    }

    [HttpGet("{projectId:guid}/validations/disclaimer")]
    public async Task<IActionResult> GetValidationDisclaimerStatus(Guid projectId, CancellationToken cancellationToken)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        if (!Guid.TryParse(userIdString, out var userId)) return Unauthorized();

        var accepted = await _dbContext.Set<ProyectoValidacionDescargo>()
            .AnyAsync(d => d.UsuarioId == userId && d.ProyectoId == projectId, cancellationToken);

        return Ok(new { accepted });
    }

    [HttpPost("{projectId:guid}/validations/disclaimer")]
    public async Task<IActionResult> AcceptValidationDisclaimer(Guid projectId, CancellationToken cancellationToken)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        if (!Guid.TryParse(userIdString, out var userId)) return Unauthorized();

        var exists = await _dbContext.Set<ProyectoValidacionDescargo>()
            .AnyAsync(d => d.UsuarioId == userId && d.ProyectoId == projectId, cancellationToken);

        if (!exists)
        {
            _dbContext.Set<ProyectoValidacionDescargo>().Add(new ProyectoValidacionDescargo(userId, projectId));
            await _dbContext.SaveChangesAsync(cancellationToken);
        }

        return Ok(new { success = true });
    }
}
