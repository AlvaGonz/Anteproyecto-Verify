namespace Application.Abstractions.Persistence;

using System;
using System.Threading;
using System.Threading.Tasks;
using Domain.Entities;

public interface IValidacionAyuntamientoRepository
{
    Task<ValidacionAyuntamiento?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<ValidacionAyuntamiento?> GetByProyectoIdAsync(Guid proyectoId, CancellationToken cancellationToken = default);
    Task AddAsync(ValidacionAyuntamiento validacion, CancellationToken cancellationToken = default);
    void Update(ValidacionAyuntamiento validacion);
}
