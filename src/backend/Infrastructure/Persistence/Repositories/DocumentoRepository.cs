namespace Infrastructure.Persistence.Repositories;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Persistence;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;

public class DocumentoRepository : IDocumentoRepository
{
    private readonly AppDbContext _context;

    public DocumentoRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Documento?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Documentos.FindAsync(new object[] { id }, cancellationToken);
    }

    public async Task<IEnumerable<Documento>> GetByProyectoIdAsync(Guid proyectoId, CancellationToken cancellationToken = default)
    {
        return await _context.Documentos
            .Where(d => d.ProyectoId == proyectoId)
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(Documento documento, CancellationToken cancellationToken = default)
    {
        await _context.Documentos.AddAsync(documento, cancellationToken);
    }

    public void Update(Documento documento)
    {
        _context.Documentos.Update(documento);
    }

    public void Delete(Documento documento)
    {
        _context.Documentos.Remove(documento);
    }
}
