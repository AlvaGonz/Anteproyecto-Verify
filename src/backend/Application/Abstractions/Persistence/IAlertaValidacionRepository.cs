namespace Application.Abstractions.Persistence;

using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Domain.Entities;

public interface IAlertaValidacionRepository
{
    Task<AlertaValidacion?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<AlertaValidacion>> GetByProyectoIdAsync(Guid proyectoId, CancellationToken cancellationToken = default);
    Task AddAsync(AlertaValidacion alerta, CancellationToken cancellationToken = default);
    void Update(AlertaValidacion alerta);
}
