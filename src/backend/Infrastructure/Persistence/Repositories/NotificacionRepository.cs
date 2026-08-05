namespace Infrastructure.Persistence.Repositories;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Persistence;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;

public class NotificacionRepository : INotificacionRepository
{
    private readonly AppDbContext _context;

    public NotificacionRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Notificacion?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Notificaciones
            .FirstOrDefaultAsync(n => n.Id == id, cancellationToken);
    }

    public async Task<IEnumerable<Notificacion>> GetByUsuarioIdAsync(Guid usuarioId, bool unreadOnly = false, CancellationToken cancellationToken = default)
    {
        var query = _context.Notificaciones.Where(n => n.UsuarioId == usuarioId);

        if (unreadOnly)
        {
            query = query.Where(n => !n.Leida);
        }

        return await query
            .Include(n => n.TipoNotificacion)
            .OrderByDescending(n => n.FechaUtc)
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(Notificacion notificacion, CancellationToken cancellationToken = default)
    {
        await _context.Notificaciones.AddAsync(notificacion, cancellationToken);
    }

    public Task UpdateAsync(Notificacion notificacion, CancellationToken cancellationToken = default)
    {
        _context.Notificaciones.Update(notificacion);
        return Task.CompletedTask;
    }

    public Task DeleteAsync(Notificacion notificacion, CancellationToken cancellationToken = default)
    {
        _context.Notificaciones.Remove(notificacion);
        return Task.CompletedTask;
    }
}
