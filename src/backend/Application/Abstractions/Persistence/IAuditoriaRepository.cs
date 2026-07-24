namespace Application.Abstractions.Persistence;

using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Domain.Entities;

public interface IAuditoriaRepository
{
    Task<IEnumerable<Auditoria>> GetByProyectoIdAsync(Guid proyectoId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Auditoria>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<Auditoria>> GetFilteredAsync(string? tipoEvento, DateTime? fromDate, DateTime? toDate, CancellationToken cancellationToken = default);
    Task AddAsync(Auditoria auditoria, CancellationToken cancellationToken = default);
}
