namespace Api.Controllers;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Security.Claims;
using Application.Abstractions.Persistence;
using Application.DTOs.Notifications;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/notifications")]
public class NotificationsController : ControllerBase
{
    private readonly INotificacionRepository _notificacionRepository;
    private readonly IUsuarioRepository _usuarioRepository;
    private readonly IUnitOfWork _unitOfWork;

    public NotificationsController(INotificacionRepository notificacionRepository, IUsuarioRepository usuarioRepository, IUnitOfWork unitOfWork)
    {
        _notificacionRepository = notificacionRepository;
        _usuarioRepository = usuarioRepository;
        _unitOfWork = unitOfWork;
    }

    [HttpGet]
    [Microsoft.AspNetCore.Authorization.Authorize]
    public async Task<IActionResult> GetMyNotifications([FromQuery] bool unreadOnly = false, CancellationToken cancellationToken = default)
    {
        var userIdString = User.FindFirstValue(System.Security.Claims.ClaimTypes.NameIdentifier) ?? User.FindFirstValue(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub) ?? User.FindFirstValue("sub");
        if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out var userId))
        {
            return Unauthorized();
        }

        var user = await _usuarioRepository.GetByIdAsync(userId, cancellationToken);
        var email = user?.Email;
        var telefono = user?.Telefono;

        var notifications = await _notificacionRepository.GetByUsuarioIdAsync(userId, unreadOnly, cancellationToken);
        
        var dtos = notifications.OrderByDescending(n => n.FechaUtc).Select(n => new NotificationDto(
            Id: n.Id,
            CodigoReferencia: n.CodigoReferencia,
            Mensaje: n.Mensaje,
            Tipo: n.Tipo,
            Leida: n.Leida,
            FechaUtc: n.FechaUtc,
            EnlaceRelacionado: n.EnlaceRelacionado,
            Email: email,
            Telefono: telefono,
            TipoNotificacionCodigo: n.TipoNotificacion?.Codigo,
            Categoria: n.TipoNotificacion?.Categoria,
            Prioridad: n.Prioridad,
            Canales: n.TipoNotificacion?.Canales,
            EntidadReferenciaId: n.EntidadReferenciaId,
            EntidadReferenciaTipo: n.EntidadReferenciaTipo
        ));

        return Ok(dtos);
    }

    [HttpPost("{id}/read")]
    [Microsoft.AspNetCore.Authorization.Authorize]
    public async Task<IActionResult> MarkAsRead(Guid id, CancellationToken cancellationToken)
    {
        var userIdString = User.FindFirstValue(System.Security.Claims.ClaimTypes.NameIdentifier) ?? User.FindFirstValue(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub) ?? User.FindFirstValue("sub");
        if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out var userId))
        {
            return Unauthorized();
        }

        var notification = await _notificacionRepository.GetByIdAsync(id, cancellationToken);
        if (notification == null)
        {
            return NotFound();
        }

        if (notification.UsuarioId != userId)
        {
            return Forbid();
        }

        notification.MarcarComoLeida();
        await _notificacionRepository.UpdateAsync(notification, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return NoContent();
    }

    [HttpPost("read-all")]
    [Microsoft.AspNetCore.Authorization.Authorize]
    public async Task<IActionResult> MarkAllAsRead(CancellationToken cancellationToken)
    {
        var userIdString = User.FindFirstValue(System.Security.Claims.ClaimTypes.NameIdentifier) ?? User.FindFirstValue(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub) ?? User.FindFirstValue("sub");
        if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out var userId))
        {
            return Unauthorized();
        }

        var notifications = await _notificacionRepository.GetByUsuarioIdAsync(userId, true, cancellationToken);
        foreach (var notification in notifications)
        {
            notification.MarcarComoLeida();
            await _notificacionRepository.UpdateAsync(notification, cancellationToken);
        }
        
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return NoContent();
    }

    [HttpDelete("{id}")]
    [Microsoft.AspNetCore.Authorization.Authorize]
    public async Task<IActionResult> DeleteNotification(Guid id, CancellationToken cancellationToken)
    {
        var userIdString = User.FindFirstValue(System.Security.Claims.ClaimTypes.NameIdentifier) ?? User.FindFirstValue(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub) ?? User.FindFirstValue("sub");
        if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out var userId))
        {
            return Unauthorized();
        }

        var notification = await _notificacionRepository.GetByIdAsync(id, cancellationToken);
        if (notification == null)
        {
            return NotFound();
        }

        if (notification.UsuarioId != userId)
        {
            return Forbid();
        }

        await _notificacionRepository.DeleteAsync(notification, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return NoContent();
    }
}
