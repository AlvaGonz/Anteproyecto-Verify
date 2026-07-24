namespace Infrastructure.Persistence.Repositories;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Persistence;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;

public class SelloIntegridadRepository : ISelloIntegridadRepository
{
    private readonly AppDbContext _context;

    public SelloIntegridadRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(SelloIntegridad sello, CancellationToken cancellationToken = default)
    {
        await _context.Set<SelloIntegridad>().AddAsync(sello, cancellationToken);
    }

    public async Task<SelloIntegridad?> GetByProyectoIdAsync(Guid proyectoId, CancellationToken cancellationToken = default)
    {
        return await _context.Set<SelloIntegridad>()
            .Where(s => s.ProyectoId == proyectoId)
            .OrderByDescending(s => s.FechaEmisionUtc)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<List<SelloIntegridad>> GetByProyectoIdsAsync(List<Guid> proyectoIds, CancellationToken cancellationToken = default)
    {
        return await _context.Set<SelloIntegridad>()
            .Where(s => proyectoIds.Contains(s.ProyectoId))
            .GroupBy(s => s.ProyectoId)
            .Select(g => g.OrderByDescending(s => s.FechaEmisionUtc).First())
            .ToListAsync(cancellationToken);
    }

    public async Task<SelloIntegridad?> GetByCodigoAsync(string codigoSello, CancellationToken cancellationToken = default)
    {
        return await _context.Set<SelloIntegridad>()
            .FirstOrDefaultAsync(s => s.CodigoSello == codigoSello, cancellationToken);
    }

    public void Update(SelloIntegridad sello)
    {
        _context.Set<SelloIntegridad>().Update(sello);
    }
}
