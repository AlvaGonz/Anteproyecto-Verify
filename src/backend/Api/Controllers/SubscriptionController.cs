using System.Security.Claims;
using Application.DTOs.Subscriptions;
using Application.Contracts.Subscriptions;
using Application.Features.Subscriptions.Queries.GetMySubscriptionStatus;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Api.Controllers;

[ApiController]
[Route("api/v1/subscriptions")]
public class SubscriptionController : ControllerBase
{
    private readonly ISender _sender;
    private readonly ISubscriptionService _subscriptionService;
    private readonly IConfiguration _configuration;
    private readonly ILogger<SubscriptionController> _logger;

    public SubscriptionController(
        ISender sender,
        ISubscriptionService subscriptionService,
        IConfiguration configuration, 
        ILogger<SubscriptionController> logger)
    {
        _sender = sender;
        _subscriptionService = subscriptionService;
        _configuration = configuration;
        _logger = logger;
    }

    [HttpPost("create-session")]
    [Authorize]
    public async Task<IActionResult> CreateSession([FromBody] CreateSessionRequest request, [FromServices] FluentValidation.IValidator<CreateSessionRequest> validator, CancellationToken ct)
    {
        var validationResult = await validator.ValidateAsync(request, ct);
        if (!validationResult.IsValid)
        {
            _logger.LogWarning("Validation failed for CreateSession: {Errors}", string.Join(", ", validationResult.Errors.Select(e => e.ErrorMessage)));
            return BadRequest(new { message = "Validation failed", errors = validationResult.Errors.Select(e => e.ErrorMessage) });
        }

        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdString, out var userId))
            return Unauthorized();

        var frontendUrl = _configuration["FrontendUrl"];
        if (string.IsNullOrEmpty(frontendUrl))
        {
            frontendUrl = Request.Headers["Origin"].ToString();
            if (string.IsNullOrEmpty(frontendUrl))
            {
                frontendUrl = "http://localhost:3000";
            }
        }

        try
        {
            var clientSecret = await _subscriptionService.CreateSessionAsync(userId, request, frontendUrl, ct);
            return Ok(new { clientSecret });
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Error creating session");
            return StatusCode(500, new { message = e.Message });
        }
    }

    [HttpGet("my-status")]
    [Authorize]
    public async Task<IActionResult> GetMySubscriptionStatus(CancellationToken ct)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdString, out var userId))
            return Unauthorized();

        try
        {
            var query = new GetMySubscriptionStatusQuery(userId);
            var status = await _sender.Send(query, ct);
            return Ok(status);
        }
        catch (InvalidOperationException e) when (e.Message == "User not found.")
        {
            return NotFound(new { message = e.Message });
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Error getting subscription status");
            return StatusCode(500, new { message = e.Message });
        }
    }

    [HttpGet("session-status")]
    [Authorize]
    public async Task<IActionResult> GetSessionStatus([FromQuery] string? sessionId, [FromQuery] string? session_id, CancellationToken ct)
    {
        var finalSessionId = sessionId ?? session_id;
        if (string.IsNullOrEmpty(finalSessionId))
            return BadRequest(new { message = "sessionId is required." });

        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdString))
            return Unauthorized();

        try
        {
            var status = await _subscriptionService.GetSessionStatusAsync(Guid.Parse(userIdString), finalSessionId, ct);
            return Ok(status);
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Error fetching session status");
            return StatusCode(500, new { message = e.Message });
        }
    }

    [HttpPost("create-portal-session")]
    [Authorize]
    public async Task<IActionResult> CreatePortalSession(CancellationToken ct)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdString, out var userId))
            return Unauthorized();

        try
        {
            var frontendUrl = _configuration["FrontendUrl"] ?? "http://localhost:3000";
            var url = await _subscriptionService.CreatePortalSessionAsync(userId, frontendUrl, ct);
            return Ok(new { url });
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Error creating portal session");
            return StatusCode(500, new { message = e.Message });
        }
    }

    [HttpPost("sync")]
    [Authorize]
    public async Task<IActionResult> SyncSubscription(CancellationToken ct)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdString, out var userId))
            return Unauthorized();

        try
        {
            await _subscriptionService.SyncSubscriptionAsync(userId, ct);
            return Ok(new { message = "Suscripción sincronizada." });
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Error syncing subscription");
            return StatusCode(500, new { message = e.Message });
        }
    }

    [HttpPost("webhook")]
    [AllowAnonymous]
    public async Task<IActionResult> Webhook(CancellationToken ct)
    {
        var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();
        
        try
        {
            var signatureHeader = Request.Headers["Stripe-Signature"];
            await _subscriptionService.HandleWebhookAsync(json, signatureHeader!, ct);
            return Ok();
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Error processing Stripe webhook: {Message}", e.Message);
            return BadRequest();
        }
    }

    [HttpPost("reconcile")]
    [Authorize]
    public async Task<IActionResult> ReconcileSubscription([FromBody] ReconcileRequest request, CancellationToken ct)
    {
        var isAdmin = await IsAdminAsync();
        if (!isAdmin)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { message = "Acceso denegado. Se requieren permisos de administrador." });
        }

        if (string.IsNullOrEmpty(request?.StripeCustomerId))
        {
            return BadRequest(new { message = "Stripe Customer ID is required." });
        }

        try
        {
            var result = await _subscriptionService.ReconcileSubscriptionAsync(request.StripeCustomerId, ct);
            return Ok(result);
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Error during subscription reconciliation");
            return StatusCode(500, new { message = e.Message });
        }
    }

    private Task<bool> IsAdminAsync()
    {
        if (User?.Identity?.IsAuthenticated != true)
        {
            return Task.FromResult(false);
        }

        var roles = User.Claims
            .Where(c => c.Type == ClaimTypes.Role || c.Type == "role")
            .Select(c => c.Value)
            .ToList();

        return Task.FromResult(roles.Any(r => 
            string.Equals(r, "admin", StringComparison.OrdinalIgnoreCase) || 
            string.Equals(r, "Administrator", StringComparison.OrdinalIgnoreCase)));
    }

    [HttpPost("cancel")]
    [Authorize]
    public async Task<IActionResult> CancelSubscription(CancellationToken ct)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdString, out var userId)) return Unauthorized();

        try
        {
            await _subscriptionService.CancelSubscriptionAsync(userId, ct);
            return Ok(new { message = "Cancelación programada." });
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Error cancelling subscription");
            return StatusCode(500, new { message = e.Message });
        }
    }

    [HttpPost("reactivate")]
    [Authorize]
    public async Task<IActionResult> ReactivateSubscription(CancellationToken ct)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdString, out var userId)) return Unauthorized();

        try
        {
            await _subscriptionService.ReactivateSubscriptionAsync(userId, ct);
            return Ok(new { message = "Suscripción reactivada exitosamente." });
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Error reactivating subscription");
            return StatusCode(500, new { message = e.Message });
        }
    }
}
