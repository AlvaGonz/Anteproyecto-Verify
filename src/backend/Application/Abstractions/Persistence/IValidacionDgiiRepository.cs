namespace Application.Abstractions.Persistence;

using System;
using System.Threading;
using System.Threading.Tasks;
using Domain.Entities;

public interface IValidacionDgiiRepository
{
    Task<ValidacionDgii?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<ValidacionDgii?> GetByProyectoIdAsync(Guid proyectoId, CancellationToken cancellationToken = default);
    Task AddAsync(ValidacionDgii validacion, CancellationToken cancellationToken = default);
    void Update(ValidacionDgii validacion);
}
