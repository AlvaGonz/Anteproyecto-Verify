namespace Infrastructure.Persistence.Repositories;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Persistence;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;

public class AlertaValidacionRepository : IAlertaValidacionRepository
{
    private readonly AppDbContext _context;

    public AlertaValidacionRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<AlertaValidacion?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Set<AlertaValidacion>()
            .FirstOrDefaultAsync(a => a.Id == id, cancellationToken);
    }

    public async Task<IEnumerable<AlertaValidacion>> GetByProyectoIdAsync(Guid proyectoId, CancellationToken cancellationToken = default)
    {
        return await _context.Set<AlertaValidacion>()
            .Where(a => a.ProyectoId == proyectoId)
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(AlertaValidacion alerta, CancellationToken cancellationToken = default)
    {
        await _context.Set<AlertaValidacion>().AddAsync(alerta, cancellationToken);
    }

    public void Update(AlertaValidacion alerta)
    {
        _context.Set<AlertaValidacion>().Update(alerta);
    }
}
