namespace Application.Abstractions.Persistence;

using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Domain.Entities;

public interface ISelloIntegridadRepository
{
    Task AddAsync(SelloIntegridad sello, CancellationToken cancellationToken = default);
    Task<SelloIntegridad?> GetByProyectoIdAsync(Guid proyectoId, CancellationToken cancellationToken = default);
    Task<List<SelloIntegridad>> GetByProyectoIdsAsync(List<Guid> proyectoIds, CancellationToken cancellationToken = default);
    Task<SelloIntegridad?> GetByCodigoAsync(string codigoSello, CancellationToken cancellationToken = default);
    void Update(SelloIntegridad sello);
}
