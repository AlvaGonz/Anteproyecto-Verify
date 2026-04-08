namespace Infrastructure.Persistence.Repositories;

using System;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Persistence;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;

public class ValidacionDgiiRepository : IValidacionDgiiRepository
{
    private readonly AppDbContext _context;

    public ValidacionDgiiRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<ValidacionDgii?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Set<ValidacionDgii>()
            .FirstOrDefaultAsync(v => v.Id == id, cancellationToken);
    }

    public async Task<ValidacionDgii?> GetByProyectoIdAsync(Guid proyectoId, CancellationToken cancellationToken = default)
    {
        return await _context.Set<ValidacionDgii>()
            .Where(v => v.ProyectoId == proyectoId)
            .OrderByDescending(v => v.CreatedAtUtc)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task AddAsync(ValidacionDgii validacion, CancellationToken cancellationToken = default)
    {
        await _context.Set<ValidacionDgii>().AddAsync(validacion, cancellationToken);
    }

    public void Update(ValidacionDgii validacion)
    {
        _context.Set<ValidacionDgii>().Update(validacion);
    }
}
