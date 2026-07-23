namespace Infrastructure.Persistence.Repositories;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Persistence;
using Domain.Entities;
using Domain.Enums;
using Microsoft.EntityFrameworkCore;

public class ReglaValidacionRepository : IReglaValidacionRepository
{
    private readonly AppDbContext _context;

    public ReglaValidacionRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<ReglaValidacion?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.ReglasValidacion.FirstOrDefaultAsync(r => r.Id == id, cancellationToken);
    }

    public async Task<IEnumerable<ReglaValidacion>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.ReglasValidacion.AsNoTracking().OrderByDescending(r => r.FechaCreacionUtc).ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<ReglaValidacion>> GetActiveRulesAsync(TipoProyecto tipoProyecto, DocumentType tipoDocumento, CancellationToken cancellationToken = default)
    {
        return await _context.ReglasValidacion
            .AsNoTracking()
            .Where(r => r.Activa && r.TipoProyecto == tipoProyecto && r.TipoDocumentoAplicable == tipoDocumento)
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(ReglaValidacion regla, CancellationToken cancellationToken = default)
    {
        await _context.ReglasValidacion.AddAsync(regla, cancellationToken);
    }
}
