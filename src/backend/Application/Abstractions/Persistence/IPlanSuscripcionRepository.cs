namespace Application.Abstractions.Persistence;

using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Domain.Entities;

public interface IPlanSuscripcionRepository
{
    Task<PlanSuscripcion?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<PlanSuscripcion?> GetByNameAsync(string name, CancellationToken cancellationToken = default);
    Task<IEnumerable<PlanSuscripcion>> GetAllAsync(CancellationToken cancellationToken = default);
}
