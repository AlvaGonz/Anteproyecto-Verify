namespace Infrastructure.Persistence.Repositories;

using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Persistence;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;

public class ProyectoRepository : IProyectoRepository
{
    private readonly AppDbContext _context;

    public ProyectoRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Proyecto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Proyectos
            .Include(p => p.UsuarioCreador)
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
    }

    public async Task<IEnumerable<Proyecto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Proyectos
            .Include(p => p.UsuarioCreador)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Proyecto>> GetVisibleAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Proyectos
            .Include(p => p.UsuarioCreador)
            .Where(p => p.EstadoProyecto != ProjectStatus.Draft && p.EstadoProyecto != ProjectStatus.Rejected)
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(Proyecto proyecto, CancellationToken cancellationToken = default)
    {
        await _context.Proyectos.AddAsync(proyecto, cancellationToken);
    }

    public void Update(Proyecto proyecto)
    {
        _context.Proyectos.Update(proyecto);
    }

    public void Delete(Proyecto proyecto)
    {
        _context.Proyectos.Remove(proyecto);
    }
}
