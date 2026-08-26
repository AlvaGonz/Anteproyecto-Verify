namespace Application.Contracts.Projects;

using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Application.DTOs;
using Application.DTOs.Common;
using Application.DTOs.Projects;
using Domain.Enums;

public interface IProjectService
{
    Task<IEnumerable<ProyectoDto>> GetVisibleProjectsAsync(int page = 1, int pageSize = 50, CancellationToken cancellationToken = default);
    Task<IEnumerable<ProyectoDto>> GetAllProjectsAsync(Guid? usuarioId = null, int page = 1, int pageSize = 50, CancellationToken cancellationToken = default);
    Task<PaginatedResult<ProyectoDto>> GetAllProjectsWithCountAsync(Guid? usuarioId = null, int page = 1, int pageSize = 50, string? searchTerm = null, string? estados = null, DateTime? startDate = null, DateTime? endDate = null, CancellationToken cancellationToken = default);
    Task<IEnumerable<ProyectoEstadoCatalogoDto>> GetEstadosCatalogoAsync(CancellationToken cancellationToken = default);
    Task<PaginatedResult<ProyectoDto>> GetVisibleProjectsWithCountAsync(int page = 1, int pageSize = 50, CancellationToken cancellationToken = default);
    Task<ProyectoDto?> GetProjectByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<ProyectoDto> CreateProjectAsync(CreateProyectoDto dto, CancellationToken cancellationToken = default);
    Task<ProyectoDto> UpdateProjectAsync(Guid id, UpdateProyectoDto dto, CancellationToken cancellationToken = default);
    Task<ProyectoDto> UpdateProjectStatusAsync(Guid id, ProjectStatus status, CancellationToken cancellationToken = default);
    Task DeleteProjectAsync(Guid id, CancellationToken cancellationToken = default);
    Task InteresarProyectoAsync(Guid proyectoId, Guid usuarioInteresadoId, CancellationToken cancellationToken = default);
    Task GuardarProyectoAsync(Guid proyectoId, Guid usuarioGuardadorId, CancellationToken cancellationToken = default);
    Task QuitarGuardadoProyectoAsync(Guid proyectoId, Guid usuarioGuardadorId, CancellationToken cancellationToken = default);
    Task QuitarInteresProyectoAsync(Guid proyectoId, Guid usuarioInteresadoId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Application.DTOs.Projects.ProyectoInteresDto>> GetProyectosInteresesAsync(Guid usuarioId, CancellationToken cancellationToken = default);
    Task<IEnumerable<ProyectoDto>> GetProyectosGuardadosAsync(Guid usuarioId, CancellationToken cancellationToken = default);
}
