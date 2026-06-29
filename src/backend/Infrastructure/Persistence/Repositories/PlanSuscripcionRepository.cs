namespace Infrastructure.Persistence.Repositories;

using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Persistence;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;

public class PlanSuscripcionRepository : IPlanSuscripcionRepository
{
    private readonly AppDbContext _context;

    public PlanSuscripcionRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<PlanSuscripcion?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.PlanesSuscripcion
            .FirstOrDefaultAsync(p => p.Idsuscripcion == id, cancellationToken);
    }

    public async Task<PlanSuscripcion?> GetByNameAsync(string name, CancellationToken cancellationToken = default)
    {
        return await _context.PlanesSuscripcion
            .FirstOrDefaultAsync(p => p.NombrePlan.ToLower() == name.ToLower(), cancellationToken);
    }

    public async Task<IEnumerable<PlanSuscripcion>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.PlanesSuscripcion
            .ToListAsync(cancellationToken);
    }
}
