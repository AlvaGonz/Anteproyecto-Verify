namespace Application.Features.Projects;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Persistence;
using Application.Contracts.Projects;
using Application.DTOs;
using Domain.Entities;
using Domain.Enums;

using Application.Abstractions.Notifications;

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

    public async Task<IEnumerable<ProyectoDto>> GetVisibleProjectsAsync(CancellationToken cancellationToken = default)
    {
        var proyectos = await _proyectoRepository.GetVisibleAsync(cancellationToken);
        return proyectos.Select(MapToDto);
    }

    public async Task<IEnumerable<ProyectoDto>> GetAllProjectsAsync(CancellationToken cancellationToken = default)
    {
        var proyectos = await _proyectoRepository.GetAllAsync(cancellationToken);
        return proyectos.Select(MapToDto);
    }

    public async Task<ProyectoDto?> GetProjectByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var proyecto = await _proyectoRepository.GetByIdAsync(id, cancellationToken);
        return proyecto != null ? MapToDto(proyecto) : null;
    }

    public async Task<ProyectoDto> CreateProjectAsync(CreateProyectoDto dto, CancellationToken cancellationToken = default)
    {
        var proyecto = new Proyecto(dto.Nombre, dto.UbicacionTexto, dto.UsuarioCreadorId, dto.Categoria, dto.DatosDesarrollador, dto.DesignacionCatastral);
        if (!string.IsNullOrEmpty(dto.UbicacionGps))
        {
            proyecto.UpdateDetails(dto.Nombre, dto.UbicacionTexto, dto.UbicacionGps, null, dto.Categoria, dto.DatosDesarrollador, dto.DesignacionCatastral);
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

        proyecto.UpdateDetails(dto.Nombre, dto.UbicacionTexto, dto.UbicacionGps, dto.ValorEstimado, dto.Categoria, dto.DatosDesarrollador, dto.DesignacionCatastral);
        proyecto.UpdateRncYMatricula(dto.RncDesarrollador, dto.Matricula);
        
        _proyectoRepository.Update(proyecto);
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

        var oldStatus = proyecto.Status;
        proyecto.UpdateStatus(status);
        
        _proyectoRepository.Update(proyecto);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        if (oldStatus != status && (status == ProjectStatus.Approved || status == ProjectStatus.Rejected))
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
        var proyecto = await _proyectoRepository.GetByIdAsync(id, cancellationToken);
        if (proyecto == null)
        {
            throw new KeyNotFoundException($"Project with id {id} not found.");
        }

        _proyectoRepository.Delete(proyecto);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    private static ProyectoDto MapToDto(Proyecto proyecto)
    {
        return new ProyectoDto(
            proyecto.Id,
            proyecto.CodigoInterno,
            proyecto.Nombre,
            proyecto.UbicacionTexto,
            proyecto.UbicacionGps,
            proyecto.ValorEstimado,
            proyecto.Categoria,
            proyecto.DatosDesarrollador,
            proyecto.RncDesarrollador,
            proyecto.DesignacionCatastral,
            proyecto.Matricula,
            proyecto.EstadoProyecto,
            proyecto.EstadoIntegridad,
            proyecto.UsuarioCreadorId,
            proyecto.CreatedAtUtc,
            proyecto.UpdatedAtUtc
        );
    }
}
