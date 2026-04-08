namespace Infrastructure.Persistence.Repositories;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Persistence;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;

public class ReporteRepository : IReporteRepository
{
    private readonly AppDbContext _context;

    public ReporteRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Reporte?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Reportes.FindAsync(new object[] { id }, cancellationToken);
    }

    public async Task<IEnumerable<Reporte>> GetByProyectoIdAsync(Guid proyectoId, CancellationToken cancellationToken = default)
    {
        return await _context.Reportes
            .Where(r => r.ProyectoId == proyectoId)
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(Reporte reporte, CancellationToken cancellationToken = default)
    {
        await _context.Reportes.AddAsync(reporte, cancellationToken);
    }

    public void Update(Reporte reporte)
    {
        _context.Reportes.Update(reporte);
    }
}
