namespace Application.Abstractions.Notifications;

using Domain.Entities;

public interface INotificationFactory
{
    Task<Notificacion> CreateAsync(
        Guid usuarioId,
        int tipoNotificacionId,
        string mensaje,
        string? enlaceRelacionado = null,
        Guid? entidadReferenciaId = null,
        string? entidadReferenciaTipo = null,
        CancellationToken ct = default);
}
