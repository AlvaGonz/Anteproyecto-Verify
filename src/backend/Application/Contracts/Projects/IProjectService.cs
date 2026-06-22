namespace Application.Contracts.Projects;

using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Application.DTOs;
using Domain.Enums;

public interface IProjectService
{
    Task<IEnumerable<ProyectoDto>> GetVisibleProjectsAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<ProyectoDto>> GetAllProjectsAsync(CancellationToken cancellationToken = default);
    Task<ProyectoDto?> GetProjectByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<ProyectoDto> CreateProjectAsync(CreateProyectoDto dto, CancellationToken cancellationToken = default);
    Task<ProyectoDto> UpdateProjectAsync(Guid id, UpdateProyectoDto dto, CancellationToken cancellationToken = default);
    Task<ProyectoDto> UpdateProjectStatusAsync(Guid id, ProjectStatus status, CancellationToken cancellationToken = default);
    Task DeleteProjectAsync(Guid id, CancellationToken cancellationToken = default);
}
