namespace Application.Abstractions.Persistence;

using System;
using System.Threading;
using System.Threading.Tasks;
using Domain.Entities;

public interface IResultadoCrediticioRepository
{
    Task AddAsync(ResultadoCrediticio resultado, CancellationToken cancellationToken = default);
    Task<ResultadoCrediticio?> GetLatestByProyectoIdAsync(Guid proyectoId, CancellationToken cancellationToken = default);
}
