namespace Application.Features.Projects;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Persistence;
using Application.Contracts.Projects;
using Application.DTOs;
using Application.DTOs.Common;
using Domain.Entities;
using Domain.Enums;
using Domain.Policies;

using Application.Abstractions.Notifications;
using Application.Common.Exceptions;

public class ProjectService : IProjectService
{
    private readonly IProyectoRepository _proyectoRepository;
    private readonly IUsuarioRepository _usuarioRepository;
    private readonly IEmailNotificationService _emailNotificationService;
    private readonly IUnitOfWork _unitOfWork;

    public ProjectService(
        IProyectoRepository proyectoRepository, 
        IUsuarioRepository usuarioRepository,
        IEmailNotificationService emailNotificationService,
        IUnitOfWork unitOfWork)
    {
        _proyectoRepository = proyectoRepository;
        _usuarioRepository = usuarioRepository;
        _emailNotificationService = emailNotificationService;
        _unitOfWork = unitOfWork;
    }

    public async Task<IEnumerable<ProyectoDto>> GetVisibleProjectsAsync(int page = 1, int pageSize = 50, CancellationToken cancellationToken = default)
    {
        var proyectos = await _proyectoRepository.GetVisibleAsync(page, pageSize, cancellationToken);
        return proyectos.Select(MapToDto);
    }

    public async Task<IEnumerable<ProyectoDto>> GetAllProjectsAsync(Guid? usuarioId = null, int page = 1, int pageSize = 50, CancellationToken cancellationToken = default)
    {
        var proyectos = await _proyectoRepository.GetAllAsync(usuarioId, page, pageSize, cancellationToken);
        return proyectos.Select(MapToDto);
    }

    public async Task<PaginatedResult<ProyectoDto>> GetAllProjectsWithCountAsync(Guid? usuarioId = null, int page = 1, int pageSize = 50, string? searchTerm = null, string? estados = null, CancellationToken cancellationToken = default)
    {
        var (items, totalCount) = await _proyectoRepository.GetAllWithCountAsync(usuarioId, page, pageSize, searchTerm, estados, cancellationToken);
        return new PaginatedResult<ProyectoDto>(
            items.Select(MapToDto).ToList(),
            totalCount,
            page,
            pageSize
        );
    }

    public async Task<PaginatedResult<ProyectoDto>> GetVisibleProjectsWithCountAsync(int page = 1, int pageSize = 50, CancellationToken cancellationToken = default)
    {
        var (items, totalCount) = await _proyectoRepository.GetVisibleWithCountAsync(page, pageSize, cancellationToken);
        return new PaginatedResult<ProyectoDto>(
            items.Select(MapToDto).ToList(),
            totalCount,
            page,
            pageSize
        );
    }

    public async Task<ProyectoDto?> GetProjectByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var proyecto = await _proyectoRepository.GetByIdAsync(id, cancellationToken);
        return proyecto != null ? MapToDto(proyecto) : null;
    }

    public async Task<ProyectoDto> CreateProjectAsync(CreateProyectoDto dto, CancellationToken cancellationToken = default)
    {
        var usuario = await _usuarioRepository.GetByIdWithPlanAsync(dto.UsuarioCreadorId, cancellationToken);
        if (usuario == null)
        {
            throw new KeyNotFoundException($"User with id {dto.UsuarioCreadorId} not found.");
        }

        var proyectosActuales = await _proyectoRepository.CountByUsuarioAsync(dto.UsuarioCreadorId, cancellationToken);
        
        if (!SubscriptionTierPolicy.CanCreateProject(usuario, proyectosActuales))
        {
            throw new QuotaExceededException(
                SubscriptionTierPolicy.GetTierName(usuario), 
                "MaxProyectos", 
                "Límite de proyectos alcanzado para su plan actual. Considere mejorar su plan.");
        }

        var categoria = await ValidateCategoriaAsync(dto.CategoriaId, cancellationToken);

        var estadoCreado = await _proyectoRepository.GetEstadoByStatusAsync(ProjectStatus.Creado, cancellationToken);
        if (estadoCreado == null)
        {
            throw new InvalidOperationException(
                "Estado 'CREADO' no encontrado en ProyectosEstados. Ejecute el seeder o la migración de estados.");
        }

        var proyecto = new Proyecto(dto.Nombre, dto.UbicacionTexto, dto.UsuarioCreadorId, dto.CategoriaId, dto.DatosDesarrollador, dto.DesignacionCatastral, dto.Propietario, dto.CedulaRncPropietario, dto.Ipi, dto.EstatusIpi, dto.SuperficieM2, dto.ImagenUrl, dto.ImagenAdicional1, dto.ImagenAdicional2, dto.ImagenAdicional3, dto.ImagenAdicional4, dto.ImagenAdicional5);
        proyecto.AsignarCategoria(categoria);
        proyecto.UpdateEstado(estadoCreado);
        if (!string.IsNullOrEmpty(dto.UbicacionGps))
        {
            proyecto.UpdateDetails(dto.Nombre, dto.UbicacionTexto, dto.UbicacionGps, null, dto.CategoriaId, dto.DatosDesarrollador, dto.DesignacionCatastral, dto.Propietario, dto.CedulaRncPropietario, dto.Ipi, dto.EstatusIpi, dto.SuperficieM2, dto.ImagenUrl, dto.ImagenAdicional1, dto.ImagenAdicional2, dto.ImagenAdicional3, dto.ImagenAdicional4, dto.ImagenAdicional5);
        }
        if (!string.IsNullOrEmpty(dto.RncDesarrollador) || !string.IsNullOrEmpty(dto.Matricula))
        {
            proyecto.UpdateRncYMatricula(dto.RncDesarrollador, dto.Matricula);
        }
        
        await _proyectoRepository.AddAsync(proyecto, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToDto(proyecto);
    }

    public async Task<ProyectoDto> UpdateProjectAsync(Guid id, UpdateProyectoDto dto, CancellationToken cancellationToken = default)
    {
        var proyecto = await _proyectoRepository.GetByIdAsync(id, cancellationToken);
        if (proyecto == null)
        {
            throw new KeyNotFoundException($"Project with id {id} not found.");
        }

        var categoria = await ValidateCategoriaAsync(dto.CategoriaId, cancellationToken);

        proyecto.UpdateDetails(dto.Nombre, dto.UbicacionTexto, dto.UbicacionGps, dto.ValorEstimado, dto.CategoriaId, dto.DatosDesarrollador, dto.DesignacionCatastral, dto.Propietario, dto.CedulaRncPropietario, dto.Ipi, dto.EstatusIpi, dto.SuperficieM2, dto.ImagenUrl, dto.ImagenAdicional1, dto.ImagenAdicional2, dto.ImagenAdicional3, dto.ImagenAdicional4, dto.ImagenAdicional5);
        proyecto.AsignarCategoria(categoria);
        proyecto.UpdateRncYMatricula(dto.RncDesarrollador, dto.Matricula);

        // Auto-promote CREADO → EDITADO when the expediente is modified
        var currentCodigo = proyecto.Estado?.CodigoUnico;
        if (string.IsNullOrEmpty(currentCodigo) || currentCodigo == ProjectStatusCodes.Creado)
        {
            var estadoEditado = await _proyectoRepository.GetEstadoByStatusAsync(ProjectStatus.Editado, cancellationToken);
            if (estadoEditado == null)
            {
                throw new InvalidOperationException(
                    "Estado 'EDITADO' no encontrado en ProyectosEstados. Ejecute el seeder o la migración de estados.");
            }
            proyecto.UpdateEstado(estadoEditado);
        }
        
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToDto(proyecto);
    }

    public async Task<ProyectoDto> UpdateProjectStatusAsync(Guid id, ProjectStatus status, CancellationToken cancellationToken = default)
    {
        var proyecto = await _proyectoRepository.GetByIdAsync(id, cancellationToken);
        if (proyecto == null)
        {
            throw new KeyNotFoundException($"Project with id {id} not found.");
        }

        if (status == ProjectStatus.Publicado)
        {
            var usuario = await _usuarioRepository.GetByIdWithPlanAsync(proyecto.UsuarioCreadorId, cancellationToken);
            if (usuario == null)
            {
                throw new KeyNotFoundException($"User with id {proyecto.UsuarioCreadorId} not found.");
            }

            if (!SubscriptionTierPolicy.IsProjectPublic(usuario))
            {
                throw new QuotaExceededException(
                    SubscriptionTierPolicy.GetTierName(usuario), 
                    "PresentacionPublica", 
                    "Su plan actual (Consultor) no permite la publicación de proyectos.");
            }
        }

        var oldStatus = proyecto.Estado?.CodigoUnico;
        var estado = await _proyectoRepository.GetEstadoByStatusAsync(status, cancellationToken);
        if (estado == null)
            throw new InvalidOperationException($"Estado {status} no encontrado.");
            
        proyecto.UpdateEstado(estado);
        
        _proyectoRepository.Update(proyecto);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        if (oldStatus != status.ToCodigoUnico() && (status == ProjectStatus.Publicado || status == ProjectStatus.ConObservacion))
        {
            var usuario = await _usuarioRepository.GetByIdAsync(proyecto.UsuarioCreadorId, cancellationToken);
            if (usuario != null && !string.IsNullOrWhiteSpace(usuario.Email))
            {
                // Fire and forget or await, depending on requirements. We await here for simplicity.
                await _emailNotificationService.SendProjectStatusChangeAsync(usuario.Email, proyecto, cancellationToken);
            }
        }

        return MapToDto(proyecto);
    }

    public async Task DeleteProjectAsync(Guid id, CancellationToken cancellationToken = default)
    {
        try
        {
            await _proyectoRepository.DeleteWithRelatedDataAsync(id, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }
        catch (KeyNotFoundException)
        {
            throw;
        }
    }

    public async Task InteresarProyectoAsync(Guid proyectoId, Guid usuarioInteresadoId, CancellationToken cancellationToken = default)
    {
        var proyecto = await _proyectoRepository.GetByIdAsync(proyectoId, cancellationToken);
        if (proyecto == null) throw new NotFoundException($"Proyecto {proyectoId} no encontrado.");
        if (proyecto.UsuarioCreadorId == usuarioInteresadoId) throw new BadRequestException("No puede interesarse en su propio proyecto.");

        var existing = await _proyectoRepository.GetInteresAsync(proyectoId, usuarioInteresadoId, cancellationToken);
        if (existing != null) return;

        var interes = new ProyectoInteresado(proyectoId, proyecto.UsuarioCreadorId, usuarioInteresadoId);
        await _proyectoRepository.AddInteresAsync(interes, cancellationToken);

        var log = new LogProyecto(usuarioInteresadoId, proyectoId, "Interés registrado en el proyecto.");
        await _proyectoRepository.AddLogProyectoAsync(log, cancellationToken);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Send email notification without blocking
        try
        {
            var creador = await _usuarioRepository.GetByIdAsync(proyecto.UsuarioCreadorId, cancellationToken);
            var interesado = await _usuarioRepository.GetByIdAsync(usuarioInteresadoId, cancellationToken);
            if (creador != null && !string.IsNullOrWhiteSpace(creador.Email) && interesado != null)
            {
                await _emailNotificationService.SendInterestRegisteredAsync(creador.Email, proyecto, interesado.NombreCompleto, cancellationToken);
            }
        }
        catch (Exception)
        {
            // Ignore email errors to prevent breaking the flow
        }
    }

    public async Task QuitarInteresProyectoAsync(Guid proyectoId, Guid usuarioInteresadoId, CancellationToken cancellationToken = default)
    {
        var existing = await _proyectoRepository.GetInteresAsync(proyectoId, usuarioInteresadoId, cancellationToken);
        if (existing == null) return;

        _proyectoRepository.RemoveInteres(existing);

        var log = new LogProyecto(usuarioInteresadoId, proyectoId, "Interés removido del proyecto.");
        await _proyectoRepository.AddLogProyectoAsync(log, cancellationToken);

        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task GuardarProyectoAsync(Guid proyectoId, Guid usuarioGuardadorId, CancellationToken cancellationToken = default)
    {
        var proyecto = await _proyectoRepository.GetByIdAsync(proyectoId, cancellationToken);
        if (proyecto == null) throw new NotFoundException($"Proyecto {proyectoId} no encontrado.");

        var existing = await _proyectoRepository.GetGuardadoAsync(proyectoId, usuarioGuardadorId, cancellationToken);
        if (existing != null) return;

        var guardado = new ProyectoGuardado(proyectoId, proyecto.UsuarioCreadorId, usuarioGuardadorId);
        await _proyectoRepository.AddGuardadoAsync(guardado, cancellationToken);

        var log = new LogProyecto(usuarioGuardadorId, proyectoId, "Proyecto guardado en lista de seguimiento.");
        await _proyectoRepository.AddLogProyectoAsync(log, cancellationToken);

        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task QuitarGuardadoProyectoAsync(Guid proyectoId, Guid usuarioGuardadorId, CancellationToken cancellationToken = default)
    {
        var existing = await _proyectoRepository.GetGuardadoAsync(proyectoId, usuarioGuardadorId, cancellationToken);
        if (existing == null) return;

        _proyectoRepository.RemoveGuardado(existing);

        var log = new LogProyecto(usuarioGuardadorId, proyectoId, "Proyecto removido de lista de guardados.");
        await _proyectoRepository.AddLogProyectoAsync(log, cancellationToken);

        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task<IEnumerable<Application.DTOs.Projects.ProyectoInteresDto>> GetProyectosInteresesAsync(Guid usuarioId, CancellationToken cancellationToken = default)    {
        var misIntereses = await _proyectoRepository.GetInteresesByUsuarioAsync(usuarioId, cancellationToken);
        var interesadosEnMisProyectos = await _proyectoRepository.GetInteresadosInUserProjectsAsync(usuarioId, cancellationToken);

        var result = new List<Application.DTOs.Projects.ProyectoInteresDto>();

        foreach (var i in misIntereses)
        {
            result.Add(new Application.DTOs.Projects.ProyectoInteresDto(
                "Mis Intereses",
                i.ProjectId,
                i.Project.Nombre,
                i.CreatorId,
                i.Project.UsuarioCreador.NombreCompleto,
                i.Project.UsuarioCreador.AvatarUrl,
                i.CreatedAtUtc,
                i.Project.UsuarioCreador.Rnc ?? "",
                i.Project.UsuarioCreador.Direccion ?? "",
                i.Project.UsuarioCreador.Telefono ?? "",
                i.Project.UsuarioCreador.CorreoElectronico ?? "",
                i.Project.UsuarioCreador.Provincia ?? i.Project.UbicacionTexto ?? ""
            ));
        }

        foreach (var i in interesadosEnMisProyectos)
        {
            result.Add(new Application.DTOs.Projects.ProyectoInteresDto(
                "Interesados",
                i.ProjectId,
                i.Project.Nombre,
                i.InterestedUserId,
                i.InterestedUser.NombreCompleto,
                i.InterestedUser.AvatarUrl,
                i.CreatedAtUtc,
                i.InterestedUser.Rnc ?? "",
                i.InterestedUser.Direccion ?? "",
                i.InterestedUser.Telefono ?? "",
                i.InterestedUser.CorreoElectronico ?? "",
                i.Project.UsuarioCreador.Provincia ?? i.Project.UbicacionTexto ?? ""
            ));
        }

        return result.OrderByDescending(x => x.Fecha);
    }

    public async Task<IEnumerable<ProyectoDto>> GetProyectosGuardadosAsync(Guid usuarioId, CancellationToken cancellationToken = default)
    {
        var guardados = await _proyectoRepository.GetGuardadosByUsuarioAsync(usuarioId, cancellationToken);
        return guardados.Select(g => MapToDto(g.Project));
    }

    private async Task<CategoriaProyecto> ValidateCategoriaAsync(int categoriaId, CancellationToken cancellationToken)
    {
        var categorias = await _proyectoRepository.GetCategoriasAsync(cancellationToken);
        var categoria = categorias.FirstOrDefault(c => c.Id == categoriaId);
        if (categoria == null || !categoria.Activo)
        {
            throw new ArgumentException(
                "La categoría seleccionada no existe o está inactiva.",
                nameof(Proyecto.CategoriaId));
        }

        return categoria;
    }

    private static ProyectoDto MapToDto(Proyecto proyecto)
    {
        ProjectRegistrantDto? registradoPor = null;
        if (proyecto.UsuarioCreador != null)
        {
            registradoPor = new ProjectRegistrantDto(
                proyecto.UsuarioCreador.Id,
                proyecto.UsuarioCreador.NombreCompleto,
                proyecto.UsuarioCreador.RazonSocial,
                proyecto.UsuarioCreador.Rol.ToString(),
                proyecto.UsuarioCreador.Email,
                proyecto.UsuarioCreador.Telefono,
                proyecto.UsuarioCreador.AvatarUrl,
                proyecto.UsuarioCreador.CreatedAtUtc,
                proyecto.UsuarioCreador.EmailVerificado,
                proyecto.UsuarioCreador.TitularId
            );
        }

        return new ProyectoDto(
            proyecto.Id,
            proyecto.CodigoInterno,
            proyecto.Nombre,
            proyecto.UbicacionTexto,
            proyecto.UbicacionGps,
            proyecto.ImagenUrl,
            proyecto.ImagenAdicional1,
            proyecto.ImagenAdicional2,
            proyecto.ImagenAdicional3,
            proyecto.ImagenAdicional4,
            proyecto.ImagenAdicional5,
            proyecto.ValorEstimado,
            proyecto.CategoriaId,
            proyecto.CategoriaProyecto?.Nombre ?? "",
            proyecto.DatosDesarrollador,
            proyecto.RncDesarrollador,
            proyecto.DesignacionCatastral,
            proyecto.Matricula,
            proyecto.Propietario,
            proyecto.CedulaRncPropietario,
            proyecto.Ipi,
            proyecto.EstadoJuridico,
            proyecto.EstatusIpi,
            proyecto.SuperficieM2,
            proyecto.EstatusDescripcion,
            proyecto.Estado?.CodigoUnico ?? "Desconocido",
            proyecto.EstadoIntegridad,
            proyecto.UsuarioCreadorId,
            proyecto.CreatedAtUtc,
            proyecto.UpdatedAtUtc,
            registradoPor,
            proyecto.UsuarioCreador?.Plan?.NombrePlan
        );
    }
}
// test codebase-memory-mcp
