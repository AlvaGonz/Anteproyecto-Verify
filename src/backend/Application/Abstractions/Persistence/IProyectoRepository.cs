namespace Application.Abstractions.Persistence;

using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Domain.Entities;

public interface IProyectoRepository
{
    Task<Proyecto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<Proyecto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<Proyecto>> GetVisibleAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<Proyecto>> SearchAsync(string query, CancellationToken cancellationToken = default);
    Task<int> CountByUsuarioAsync(Guid usuarioId, CancellationToken cancellationToken = default);
    Task AddAsync(Proyecto proyecto, CancellationToken cancellationToken = default);
    void Update(Proyecto proyecto);
    void Delete(Proyecto proyecto);
}
