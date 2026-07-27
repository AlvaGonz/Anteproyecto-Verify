namespace Application.Abstractions.Persistence;

using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Domain.Entities;
using Domain.Enums;

public interface IProyectoRepository
{
    Task<Proyecto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<(IEnumerable<Proyecto> Items, int TotalCount)> GetAllWithCountAsync(Guid? usuarioId = null, int page = 1, int pageSize = 50, CancellationToken cancellationToken = default);
    Task<IEnumerable<Proyecto>> GetAllAsync(Guid? usuarioId = null, int page = 1, int pageSize = 50, CancellationToken cancellationToken = default);
    Task<(IEnumerable<Proyecto> Items, int TotalCount)> GetVisibleWithCountAsync(int page = 1, int pageSize = 50, CancellationToken cancellationToken = default);
    Task<IEnumerable<Proyecto>> GetVisibleAsync(int page = 1, int pageSize = 50, CancellationToken cancellationToken = default);
    Task<IEnumerable<Proyecto>> GetFeaturedAsync(int count, CancellationToken cancellationToken = default);
    Task<ProyectoEstado?> GetEstadoByStatusAsync(ProjectStatus status, CancellationToken cancellationToken = default);
    Task<IEnumerable<Proyecto>> SearchAsync(string query, CancellationToken cancellationToken = default);
    Task<int> CountByUsuarioAsync(Guid usuarioId, CancellationToken cancellationToken = default);
    Task AddAsync(Proyecto proyecto, CancellationToken cancellationToken = default);
    void Update(Proyecto proyecto);
    void Delete(Proyecto proyecto);
    Task DeleteWithRelatedDataAsync(Guid proyectoId, CancellationToken cancellationToken = default);
    Task AddInteresAsync(ProyectoInteresado interes, CancellationToken cancellationToken = default);
    Task AddGuardadoAsync(ProyectoGuardado guardado, CancellationToken cancellationToken = default);
    void RemoveGuardado(ProyectoGuardado guardado);
    Task<ProyectoInteresado?> GetInteresAsync(Guid proyectoId, Guid usuarioId, CancellationToken cancellationToken = default);
    Task<ProyectoGuardado?> GetGuardadoAsync(Guid proyectoId, Guid usuarioId, CancellationToken cancellationToken = default);
    void RemoveInteres(ProyectoInteresado interes);
    Task<IEnumerable<ProyectoGuardado>> GetGuardadosByUsuarioAsync(Guid usuarioId, CancellationToken cancellationToken = default);
    Task<IEnumerable<ProyectoInteresado>> GetInteresesByUsuarioAsync(Guid usuarioId, CancellationToken cancellationToken = default);
    Task<IEnumerable<ProyectoInteresado>> GetInteresadosInUserProjectsAsync(Guid usuarioCreadorId, CancellationToken cancellationToken = default);
    Task AddLogProyectoAsync(LogProyecto log, CancellationToken cancellationToken = default);
    Task<int> GetDocumentCompletionRateAsync(Guid proyectoId, ProjectCategory category, CancellationToken cancellationToken = default);
}

