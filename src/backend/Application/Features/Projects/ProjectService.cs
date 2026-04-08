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

public class ProjectService : IProjectService
{
    private readonly IProyectoRepository _proyectoRepository;
    private readonly IUnitOfWork _unitOfWork;

    public ProjectService(IProyectoRepository proyectoRepository, IUnitOfWork unitOfWork)
    {
        _proyectoRepository = proyectoRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<IEnumerable<ProyectoDto>> GetVisibleProjectsAsync(CancellationToken cancellationToken = default)
    {
        var proyectos = await _proyectoRepository.GetVisibleAsync(cancellationToken);
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

        proyecto.UpdateStatus(status);
        
        _proyectoRepository.Update(proyecto);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToDto(proyecto);
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
            proyecto.DesignacionCatastral,
            proyecto.EstadoProyecto,
            proyecto.EstadoIntegridad,
            proyecto.UsuarioCreadorId,
            proyecto.CreatedAtUtc,
            proyecto.UpdatedAtUtc
        );
    }
}
