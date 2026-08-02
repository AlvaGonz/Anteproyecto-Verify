namespace Api.Controllers;

using System;
using System.Threading;
using System.Threading.Tasks;
using System.Security.Claims;
using Application.Abstractions;
using Application.Abstractions.Persistence;
using Application.Abstractions.Security;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

public record DeleteAccountRequest(
    string Confirmation,
    string Password,
    string? DeletionReason
);

[Authorize]
[ApiController]
[Route("api/account")]
public class AccountController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IUsuarioRepository _usuarioRepository;
    private readonly IStripeService _stripeService;
    private readonly IAuditLogger _auditLogger;

    public AccountController(
        AppDbContext context,
        IPasswordHasher passwordHasher,
        IUsuarioRepository usuarioRepository,
        IStripeService stripeService,
        IAuditLogger auditLogger)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _usuarioRepository = usuarioRepository;
        _stripeService = stripeService;
        _auditLogger = auditLogger;
    }

    private Guid GetCurrentUserId()
    {
        var idStr = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        if (string.IsNullOrEmpty(idStr) || !Guid.TryParse(idStr, out var id))
            throw new UnauthorizedAccessException("Usuario no autenticado.");
        return id;
    }

    [HttpPost("delete")]
    [Api.Common.RequireTwoFactor]
    public async Task<IActionResult> RequestDeletion([FromBody] DeleteAccountRequest request, CancellationToken cancellationToken)
    {
        if (request.Confirmation != "ELIMINAR")
            return BadRequest(new { Message = "Debe escribir 'ELIMINAR' para confirmar." });

        var userId = GetCurrentUserId();
        var user = await _usuarioRepository.GetByIdAsync(userId, cancellationToken);
        if (user == null)
            return NotFound(new { Message = "Usuario no encontrado." });

        if (!_passwordHasher.VerifyPassword(request.Password, user.ContrasenaHash))
            return Unauthorized(new { Message = "Contraseña incorrecta." });

        try
        {
            user.RequestDeletion(request.DeletionReason);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { Message = ex.Message });
        }

        // Cancel Stripe at period end if active
        if (!string.IsNullOrEmpty(user.StripeSubscriptionId) &&
            user.SubscriptionStatus == "active")
        {
            await _stripeService.CancelAtPeriodEndAsync(user.StripeSubscriptionId, cancellationToken);
        }

        _usuarioRepository.Update(user);
        await _context.SaveChangesAsync(cancellationToken);

        await _auditLogger.AppendAsync(new AuditEntryDto
        {
            UsuarioId = user.Id,
            TipoOperacion = TipoOperacion.CuentaEliminada,
            Accion = "Solicitud de eliminación de cuenta",
            Resultado = "Éxito"
        }, cancellationToken);

        // Clear auth cookies
        Response.Cookies.Delete("jwt");
        Response.Cookies.Delete("refreshToken");

        return Ok(new { Message = "Cuenta marcada para eliminación. Tiene 14 días para recuperarla." });
    }

    [HttpPost("recover")]
    public async Task<IActionResult> RecoverAccount(CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();
        var user = await _usuarioRepository.GetByIdAsync(userId, cancellationToken);
        if (user == null)
            return NotFound(new { Message = "Usuario no encontrado." });

        try
        {
            user.RecoverAccount();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { Message = ex.Message });
        }

        _usuarioRepository.Update(user);
        await _context.SaveChangesAsync(cancellationToken);

        await _auditLogger.AppendAsync(new AuditEntryDto
        {
            UsuarioId = user.Id,
            TipoOperacion = TipoOperacion.CuentaRecuperada,
            Accion = "Recuperación de cuenta",
            Resultado = "Éxito"
        }, cancellationToken);

        return Ok(new { Message = "Cuenta recuperada exitosamente." });
    }

    [HttpPost("descargo")]
    public async Task<IActionResult> AcceptDisclaimer(CancellationToken cancellationToken)
    {
        Guid userId;
        try
        {
            userId = GetCurrentUserId();
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized();
        }

        var user = await _context.Set<Usuario>().FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);
        if (user == null)
            return NotFound(new { Message = "Usuario no encontrado." });

        user.AceptarDescargo();
        _usuarioRepository.Update(user);
        await _context.SaveChangesAsync(cancellationToken);

        await _auditLogger.AppendAsync(new AuditEntryDto
        {
            UsuarioId = user.Id,
            TipoOperacion = TipoOperacion.General,
            Accion = "Aceptación de descargo de responsabilidad",
            Resultado = "Éxito"
        }, cancellationToken);

        return Ok(new { Success = true, Message = "Descargo de responsabilidad aceptado." });
    }
}
