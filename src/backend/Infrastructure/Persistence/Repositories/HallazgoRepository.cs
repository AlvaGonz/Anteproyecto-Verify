namespace Infrastructure.Persistence.Repositories;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Persistence;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;

public class HallazgoRepository : IHallazgoRepository
{
    private readonly AppDbContext _context;

    public HallazgoRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Hallazgo?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Hallazgos.FindAsync(new object[] { id }, cancellationToken);
    }

    public async Task<IEnumerable<Hallazgo>> GetByProyectoIdAsync(Guid proyectoId, CancellationToken cancellationToken = default)
    {
        return await _context.Hallazgos
            .Where(h => h.ProyectoId == proyectoId)
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(Hallazgo hallazgo, CancellationToken cancellationToken = default)
    {
        await _context.Hallazgos.AddAsync(hallazgo, cancellationToken);
    }

    public void Update(Hallazgo hallazgo)
    {
        _context.Hallazgos.Update(hallazgo);
    }
}
