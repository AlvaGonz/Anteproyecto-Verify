namespace Infrastructure.Persistence.Repositories;

using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Persistence;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;

public class DeteccionDuplicidadRepository : IDeteccionDuplicidadRepository
{
    private readonly AppDbContext _context;

    public DeteccionDuplicidadRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<DeteccionDuplicidad?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Set<DeteccionDuplicidad>()
            .FirstOrDefaultAsync(d => d.Id == id, cancellationToken);
    }

    public async Task<DeteccionDuplicidad?> GetByProyectoIdAsync(Guid proyectoId, CancellationToken cancellationToken = default)
    {
        return await _context.Set<DeteccionDuplicidad>()
            .Where(d => d.ProyectoId == proyectoId)
            .OrderByDescending(d => d.CreatedAtUtc)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task AddAsync(DeteccionDuplicidad deteccion, CancellationToken cancellationToken = default)
    {
        await _context.Set<DeteccionDuplicidad>().AddAsync(deteccion, cancellationToken);
    }
}
