namespace Infrastructure.Persistence.Repositories;

using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Persistence;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;

public class ResultadoCrediticioRepository : IResultadoCrediticioRepository
{
    private readonly AppDbContext _context;

    public ResultadoCrediticioRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(ResultadoCrediticio resultado, CancellationToken cancellationToken = default)
    {
        await _context.Set<ResultadoCrediticio>().AddAsync(resultado, cancellationToken);
    }

    public async Task<ResultadoCrediticio?> GetLatestByProyectoIdAsync(Guid proyectoId, CancellationToken cancellationToken = default)
    {
        return await _context.Set<ResultadoCrediticio>()
            .Where(r => r.ProyectoId == proyectoId)
            .OrderByDescending(r => r.FechaConsultaUtc)
            .FirstOrDefaultAsync(cancellationToken);
    }
}
