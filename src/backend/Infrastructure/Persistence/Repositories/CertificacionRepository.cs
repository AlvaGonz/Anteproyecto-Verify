namespace Infrastructure.Persistence.Repositories;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Persistence;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;

public class CertificacionRepository : ICertificacionRepository
{
    private readonly AppDbContext _context;

    public CertificacionRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Certificacion?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Certificaciones
            .Include(c => c.Proyecto)
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
    }

    public async Task<Certificacion?> GetByCodigoAsync(string codigo, CancellationToken cancellationToken = default)
    {
        return await _context.Certificaciones
            .Include(c => c.Proyecto)
            .FirstOrDefaultAsync(c => c.CodigoVerificacion == codigo, cancellationToken);
    }

    public async Task<IEnumerable<Certificacion>> GetByProyectoIdAsync(Guid proyectoId, CancellationToken cancellationToken = default)
    {
        return await _context.Certificaciones
            .Where(c => c.ProyectoId == proyectoId)
            .OrderByDescending(c => c.CreatedAtUtc)
            .ToListAsync(cancellationToken);
    }

    public async Task<Certificacion?> GetCurrentByProyectoIdAsync(Guid proyectoId, CancellationToken cancellationToken = default)
    {
        return await _context.Certificaciones
            .Include(c => c.Proyecto)
            .Where(c => c.ProyectoId == proyectoId && !c.Revocado)
            .OrderByDescending(c => c.CreatedAtUtc)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task AddAsync(Certificacion certificacion, CancellationToken cancellationToken = default)
    {
        await _context.Certificaciones.AddAsync(certificacion, cancellationToken);
    }

    public void Update(Certificacion certificacion)
    {
        _context.Certificaciones.Update(certificacion);
    }
}
