namespace Application.Abstractions.Persistence;

using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Domain.Entities;

public interface ICertificacionRepository
{
    Task<Certificacion?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Certificacion?> GetByCodigoAsync(string codigo, CancellationToken cancellationToken = default);
    Task<IEnumerable<Certificacion>> GetByProyectoIdAsync(Guid proyectoId, CancellationToken cancellationToken = default);
    Task<Certificacion?> GetCurrentByProyectoIdAsync(Guid proyectoId, CancellationToken cancellationToken = default);
    Task AddAsync(Certificacion certificacion, CancellationToken cancellationToken = default);
    void Update(Certificacion certificacion);
}
