using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Notifications;
using Domain.Entities;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Services;

public class NotificationFactory : INotificationFactory
{
    private readonly AppDbContext _context;

    public NotificationFactory(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Notificacion> CreateAsync(
        Guid usuarioId,
        int tipoNotificacionId,
        string mensaje,
        string? enlaceRelacionado = null,
        Guid? entidadReferenciaId = null,
        string? entidadReferenciaTipo = null,
        CancellationToken ct = default)
    {
        // ponytail: FindAsync by PK is cached by EF change tracker, no query needed
        var tipo = await _context.TiposNotificaciones.FindAsync([tipoNotificacionId], ct)
            ?? throw new InvalidOperationException($"TipoNotificacionId {tipoNotificacionId} no encontrado.");

        var canales = tipo.Canales
            .Split(',', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries);

        return new Notificacion(
            usuarioId,
            mensaje,
            tipo.Id,
            tipo.Codigo,
            tipo.Prioridad,
            canales,
            enlaceRelacionado,
            entidadReferenciaId,
            entidadReferenciaTipo);
    }
}
