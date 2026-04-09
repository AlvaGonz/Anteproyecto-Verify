namespace Infrastructure.Persistence.Repositories;

using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Persistence;
using Domain.Entities;
using Domain.Enums;
using Microsoft.EntityFrameworkCore;

public class ConsentimientoRepository : IConsentimientoRepository
{
    private readonly AppDbContext _context;

    public ConsentimientoRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<ConsentimientoFinanciero?> GetVigenteByUsuarioIdAsync(Guid usuarioId, CancellationToken cancellationToken = default)
    {
        var consentimiento = await _context.Set<ConsentimientoFinanciero>()
            .Where(c => c.UsuarioId == usuarioId && c.Estado == EstadoConsentimiento.Vigente)
            .OrderByDescending(c => c.FechaHoraUtc)
            .FirstOrDefaultAsync(cancellationToken);

        if (consentimiento != null)
        {
            consentimiento.VerificarVigencia();
            if (consentimiento.Estado != EstadoConsentimiento.Vigente)
            {
                _context.Update(consentimiento);
                await _context.SaveChangesAsync(cancellationToken);
                return null;
            }
        }

        return consentimiento;
    }

    public async Task AddAsync(ConsentimientoFinanciero consentimiento, CancellationToken cancellationToken = default)
    {
        await _context.Set<ConsentimientoFinanciero>().AddAsync(consentimiento, cancellationToken);
    }

    public void Update(ConsentimientoFinanciero consentimiento)
    {
        _context.Set<ConsentimientoFinanciero>().Update(consentimiento);
    }
}
