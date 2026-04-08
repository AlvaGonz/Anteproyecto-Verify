namespace Application.Abstractions.Persistence;

using System;
using System.Threading;
using System.Threading.Tasks;
using Domain.Entities;

public interface IDeteccionDuplicidadRepository
{
    Task<DeteccionDuplicidad?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<DeteccionDuplicidad?> GetByProyectoIdAsync(Guid proyectoId, CancellationToken cancellationToken = default);
    Task AddAsync(DeteccionDuplicidad deteccion, CancellationToken cancellationToken = default);
}
