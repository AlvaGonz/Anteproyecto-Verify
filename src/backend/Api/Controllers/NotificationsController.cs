namespace Api.Controllers;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Persistence;
using Application.DTOs.Notifications;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/notifications")]
public class NotificationsController : ControllerBase
{
    private readonly INotificacionRepository _notificacionRepository;

    public NotificationsController(INotificacionRepository notificacionRepository)
    {
        _notificacionRepository = notificacionRepository;
    }

    [HttpGet]
    public async Task<IActionResult> GetMyNotifications([FromQuery] bool unreadOnly = false, CancellationToken cancellationToken = default)
    {
        // En un entorno real, obtendríamos el UsuarioId del token JWT.
        // Por ahora, usamos un Guid hardcodeado o lo pasamos por header para simular.
        var userIdString = Request.Headers["X-User-Id"].FirstOrDefault() ?? "00000000-0000-0000-0000-000000000001";
        if (!Guid.TryParse(userIdString, out var userId))
        {
            return Unauthorized();
        }

        var notifications = await _notificacionRepository.GetByUsuarioIdAsync(userId, unreadOnly, cancellationToken);
        
        var dtos = notifications.OrderByDescending(n => n.FechaUtc).Select(n => new NotificationDto(
            Id: n.Id,
            Mensaje: n.Mensaje,
            Tipo: n.Tipo,
            Leida: n.Leida,
            FechaUtc: n.FechaUtc,
            EnlaceRelacionado: n.EnlaceRelacionado
        ));

        return Ok(dtos);
    }

    [HttpPost("{id}/read")]
    public async Task<IActionResult> MarkAsRead(Guid id, CancellationToken cancellationToken)
    {
        var notification = await _notificacionRepository.GetByIdAsync(id, cancellationToken);
        if (notification == null)
        {
            return NotFound();
        }

        notification.MarcarComoLeida();
        await _notificacionRepository.UpdateAsync(notification, cancellationToken);

        return NoContent();
    }
}
