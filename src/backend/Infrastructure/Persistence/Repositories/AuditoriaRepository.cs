namespace Infrastructure.Persistence.Repositories;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Persistence;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;

public class AuditoriaRepository : IAuditoriaRepository
{
    private readonly AppDbContext _context;

    public AuditoriaRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Auditoria>> GetByProyectoIdAsync(Guid proyectoId, CancellationToken cancellationToken = default)
    {
        return await _context.Auditorias
            .Where(a => a.ProyectoId == proyectoId)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Auditoria>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Auditorias.ToListAsync(cancellationToken);
    }

    public async Task AddAsync(Auditoria auditoria, CancellationToken cancellationToken = default)
    {
        await _context.Auditorias.AddAsync(auditoria, cancellationToken);
    }
}
