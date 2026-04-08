namespace Application.Abstractions.Persistence;

using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Domain.Entities;

public interface IHallazgoRepository
{
    Task<Hallazgo?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<Hallazgo>> GetByProyectoIdAsync(Guid proyectoId, CancellationToken cancellationToken = default);
    Task AddAsync(Hallazgo hallazgo, CancellationToken cancellationToken = default);
    void Update(Hallazgo hallazgo);
}
