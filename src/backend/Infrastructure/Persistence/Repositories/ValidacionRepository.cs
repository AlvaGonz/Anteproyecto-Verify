namespace Infrastructure.Persistence.Repositories;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Persistence;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;

public class ValidacionRepository : IValidacionRepository
{
    private readonly AppDbContext _context;

    public ValidacionRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Validacion?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Validaciones.FindAsync(new object[] { id }, cancellationToken);
    }

    public async Task<IEnumerable<Validacion>> GetByProyectoIdAsync(Guid proyectoId, CancellationToken cancellationToken = default)
    {
        return await _context.Validaciones
            .Where(v => v.ProyectoId == proyectoId)
            .ToListAsync(cancellationToken);
    }

    public async Task<Validacion?> GetLatestByProjectIdAsync(Guid proyectoId, string fuenteValidacion, CancellationToken cancellationToken = default)
    {
        return await _context.Validaciones
            .Include(v => v.ResultadosRegla)
            .Where(v => v.ProyectoId == proyectoId && v.FuenteValidacion == fuenteValidacion)
            .OrderByDescending(v => v.CreatedAtUtc)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task AddAsync(Validacion validacion, CancellationToken cancellationToken = default)
    {
        await _context.Validaciones.AddAsync(validacion, cancellationToken);
    }

    public void Update(Validacion validacion)
    {
        _context.Validaciones.Update(validacion);
    }
}
