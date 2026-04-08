namespace Application.Abstractions.Persistence;

using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Domain.Entities;

public interface IValidacionRepository
{
    Task<Validacion?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<Validacion>> GetByProyectoIdAsync(Guid proyectoId, CancellationToken cancellationToken = default);
    Task<Validacion?> GetLatestByProjectIdAsync(Guid proyectoId, string fuenteValidacion, CancellationToken cancellationToken = default);
    Task AddAsync(Validacion validacion, CancellationToken cancellationToken = default);
    void Update(Validacion validacion);
}
