namespace Infrastructure.Persistence.Repositories;

using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Persistence;
using Domain.Entities;
using Domain.Enums;
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
                .ThenInclude(u => u.Plan)
            .Include(p => p.Estado)
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
    }

    public async Task<IEnumerable<Proyecto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Proyectos
            .Include(p => p.UsuarioCreador)
                .ThenInclude(u => u.Plan)
            .Include(p => p.Estado)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Proyecto>> GetVisibleAsync(CancellationToken cancellationToken = default)
    {
        var draftCode = ProjectStatus.Creado.ToCodigoUnico();

        return await _context.Proyectos
            .Include(p => p.UsuarioCreador)
                .ThenInclude(u => u.Plan)
            .Include(p => p.Estado)
            .Where(p => p.Estado.CodigoUnico != draftCode)
            .ToListAsync(cancellationToken);
    }

    public async Task<ProyectoEstado?> GetEstadoByStatusAsync(ProjectStatus status, CancellationToken cancellationToken = default)
    {
        var codigo = status.ToCodigoUnico();
        return await _context.ProyectoEstados
            .FirstOrDefaultAsync(e => e.CodigoUnico == codigo, cancellationToken);
    }

    public async Task<IEnumerable<Proyecto>> SearchAsync(string query, CancellationToken cancellationToken = default)
    {
        return await _context.Proyectos
            .Include(p => p.UsuarioCreador)
                .ThenInclude(u => u.Plan)
            .Include(p => p.Estado)
            .Where(p => 
                p.CedulaRncPropietario == query ||
                p.Ipi == query ||
                p.RncDesarrollador == query ||
                p.Matricula == query ||
                _context.Set<SelloIntegridad>().Any(s => s.ProyectoId == p.Id && s.CodigoSello == query)
            )
            .ToListAsync(cancellationToken);
    }

    public async Task<int> CountByUsuarioAsync(Guid usuarioId, CancellationToken cancellationToken = default)
    {
        return await _context.Proyectos
            .CountAsync(p => p.UsuarioCreadorId == usuarioId, cancellationToken);
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

    /// <summary>
    /// Deletes all related records with Restrict FK constraints before removing the project itself.
    /// Necessary because SellosIntegridad, ResultadosCrediticios, LogProyectos, and Auditorias
    /// use DeleteBehavior.Restrict — EF cannot cascade them automatically.
    /// </summary>
    public async Task DeleteWithRelatedDataAsync(Guid proyectoId, CancellationToken cancellationToken = default)
    {
        // 1. SellosIntegridad — Restrict on ProyectoId
        var sellos = await _context.SellosIntegridad
            .Where(s => s.ProyectoId == proyectoId)
            .ToListAsync(cancellationToken);
        _context.SellosIntegridad.RemoveRange(sellos);

        // 2. ResultadosCrediticios — Restrict on ProyectoId
        var resultadosCrediticios = await _context.ResultadosCrediticios
            .Where(r => r.ProyectoId == proyectoId)
            .ToListAsync(cancellationToken);
        _context.ResultadosCrediticios.RemoveRange(resultadosCrediticios);

        // 3. LogProyectos — Restrict on ProyectoId
        var logs = await _context.LogProyectos
            .Where(l => l.ProyectoId == proyectoId)
            .ToListAsync(cancellationToken);
        _context.LogProyectos.RemoveRange(logs);

        // 4. Auditorias — Restrict on ProyectoId
        var auditorias = await _context.Auditorias
            .Where(a => a.ProyectoId == proyectoId)
            .ToListAsync(cancellationToken);
        _context.Auditorias.RemoveRange(auditorias);

        // 5. Remove the project (Documentos, Validaciones, Hallazgos, Reportes cascade automatically)
        var proyecto = await _context.Proyectos.FindAsync(new object[] { proyectoId }, cancellationToken);
        if (proyecto == null)
            throw new KeyNotFoundException($"Project with id {proyectoId} not found.");

        _context.Proyectos.Remove(proyecto);
    }
}
