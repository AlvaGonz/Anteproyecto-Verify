namespace Infrastructure.Persistence.Repositories;

using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Persistence;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;

public class ValidacionAyuntamientoRepository : IValidacionAyuntamientoRepository
{
    private readonly AppDbContext _context;

    public ValidacionAyuntamientoRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<ValidacionAyuntamiento?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Set<ValidacionAyuntamiento>()
            .FirstOrDefaultAsync(v => v.Id == id, cancellationToken);
    }

    public async Task<ValidacionAyuntamiento?> GetByProyectoIdAsync(Guid proyectoId, CancellationToken cancellationToken = default)
    {
        return await _context.Set<ValidacionAyuntamiento>()
            .Where(v => v.ProyectoId == proyectoId)
            .OrderByDescending(v => v.CreatedAtUtc)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task AddAsync(ValidacionAyuntamiento validacion, CancellationToken cancellationToken = default)
    {
        await _context.Set<ValidacionAyuntamiento>().AddAsync(validacion, cancellationToken);
    }

    public void Update(ValidacionAyuntamiento validacion)
    {
        _context.Set<ValidacionAyuntamiento>().Update(validacion);
    }
}
