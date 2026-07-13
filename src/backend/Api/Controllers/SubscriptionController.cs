using System.Security.Claims;
using Application.DTOs.Subscriptions;
using Domain.Entities;
using Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Stripe;
using Stripe.Checkout;
using Application.Abstractions.Notifications;

namespace Api.Controllers;

[ApiController]
[Route("api/v1/subscriptions")]
public class SubscriptionController : ControllerBase
{
    private readonly AppDbContext _dbContext;
    private readonly IConfiguration _configuration;
    private readonly ILogger<SubscriptionController> _logger;
    private readonly IEmailService _emailService;

    public SubscriptionController(
        AppDbContext dbContext, 
        IConfiguration configuration, 
        ILogger<SubscriptionController> logger,
        IEmailService emailService)
    {
        _dbContext = dbContext;
        _configuration = configuration;
        _logger = logger;
        _emailService = emailService;
        StripeConfiguration.ApiKey = _configuration["Stripe:SecretKey"];
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

        var user = await _dbContext.Usuarios.FirstOrDefaultAsync(u => u.Id == userId, ct);
        if (user == null)
            return NotFound(new { message = "User not found." });

        if (string.IsNullOrEmpty(_configuration["Stripe:SecretKey"]))
        {
            return StatusCode(500, new { message = "Stripe Secret Key is not configured on the server." });
        }

        if (!string.IsNullOrEmpty(request.PlanCode) || !string.IsNullOrEmpty(request.BillingCycle))
        {
            user.SetPendingPlan(request.PlanCode ?? user.PendingPlanCode, request.BillingCycle ?? user.PendingBillingCycle);
            await _dbContext.SaveChangesAsync(ct);
        }

        try
        {
            var customerId = user.StripeCustomerId;

            if (string.IsNullOrEmpty(customerId))
            {
                var customerOptions = new CustomerCreateOptions
                {
                    Email = user.Email,
                    Name = user.NombreCompleto
                };
                var customerService = new CustomerService();
                var customer = await customerService.CreateAsync(customerOptions, cancellationToken: ct);
                
                user.SetStripeCustomerId(customer.Id);
                await _dbContext.SaveChangesAsync(ct);
                customerId = customer.Id;
            }

            var frontendUrl = _configuration["FrontendUrl"];
            if (string.IsNullOrEmpty(frontendUrl))
            {
                frontendUrl = Request.Headers["Origin"].ToString();
                if (string.IsNullOrEmpty(frontendUrl))
                {
                    frontendUrl = "http://localhost:3000";
                }
            }

            var options = new SessionCreateOptions
            {
                UiMode = "embedded_page",
                Mode = "subscription",
                Customer = customerId,
                ReturnUrl = frontendUrl.TrimEnd('/') + "/#/checkout/return?session_id={CHECKOUT_SESSION_ID}",
                LineItems = new List<SessionLineItemOptions>
                {
                    new SessionLineItemOptions
                    {
                        Price = request.PriceId,
                        Quantity = 1
                    }
                }
            };

            var sessionService = new SessionService();
            var session = await sessionService.CreateAsync(options, cancellationToken: ct);

            return Ok(new { clientSecret = session.ClientSecret });
        }
        catch (StripeException e)
        {
            _logger.LogError(e, "Stripe API error");
            return StatusCode(500, new { message = e.StripeError?.Message ?? e.Message });
        }
    }

    [HttpGet("my-status")]
    [Authorize]
    public async Task<IActionResult> GetMySubscriptionStatus(CancellationToken ct)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdString, out var userId))
            return Unauthorized();

        var user = await _dbContext.Usuarios
            .Include(u => u.Plan)
            .Include(u => u.Titular)
                .ThenInclude(t => t!.Plan)
            .FirstOrDefaultAsync(u => u.Id == userId, ct);

        if (user == null)
            return NotFound(new { message = "User not found." });

        // Derive a meaningful status:
        // 1. If Stripe has set a status, use it.
        // 2. If the user has a plan assigned (via seeder or direct assignment) but no Stripe
        //    subscription yet, treat as "active" — the plan IS in effect.
        // 3. Otherwise null (no plan).
        var hasPlan = user.Plan != null;
        var effectiveStatus = user.SubscriptionStatus
            ?? (hasPlan ? "active" : null);

        // If a plan is free (price = 0), treat it as "free" tier, not fully "active"
        var isFree = hasPlan && user.Plan!.Precio == 0m;
        if (isFree && effectiveStatus == "active")
            effectiveStatus = "free";

        // If they have a Stripe Customer ID but no subscription ID/status, and the assigned plan is not free,
        // it means the checkout was incomplete (Paco Mico's case).
        if (!string.IsNullOrEmpty(user.StripeCustomerId) && 
            string.IsNullOrEmpty(user.StripeSubscriptionId) && 
            hasPlan && !isFree)
        {
            effectiveStatus = "incomplete";
        }

        if (effectiveStatus == "active" && user.CancelAtPeriodEnd)
        {
            effectiveStatus = "canceling";
        }

        string? billingCycle = user.PendingBillingCycle;
        if (string.IsNullOrEmpty(billingCycle) && !string.IsNullOrEmpty(user.StripeSubscriptionId))
        {
            try
            {
                var subService = new SubscriptionService();
                var sub = await subService.GetAsync(user.StripeSubscriptionId, cancellationToken: ct);
                if (sub != null && sub.Items.Data.Count > 0)
                {
                    billingCycle = sub.Items.Data[0].Price.Recurring.Interval;
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Could not fetch Stripe subscription for User {UserId}", user.Id);
            }
        }

        return Ok(new
        {
            plan = user.Plan?.NombrePlan,
            planPrice = user.Plan?.Precio,
            subscriptionStatus = effectiveStatus,
            currentPeriodEnd = user.CurrentPeriodEnd,
            cancelAtPeriodEnd = user.CancelAtPeriodEnd,
            cancelAt = user.CancelAt,
            stripeSubscriptionId = user.StripeSubscriptionId,
            isManagedByStripe = !string.IsNullOrEmpty(user.StripeSubscriptionId),
            billingCycle = !string.IsNullOrEmpty(user.PendingBillingCycle) ? user.PendingBillingCycle : billingCycle,
            isGuest = user.TitularId != null,
            inviterPlan = user.Titular?.Plan?.NombrePlan,
            inviterName = user.Titular?.NombreCompleto
        });
    }

    [HttpGet("session-status")]
    [Authorize]
    public async Task<IActionResult> GetSessionStatus([FromQuery] string? sessionId, [FromQuery] string? session_id, CancellationToken ct)
    {
        if (string.IsNullOrEmpty(_configuration["Stripe:SecretKey"]))
        {
            return StatusCode(500, new { message = "Stripe Secret Key is not configured on the server." });
        }

        var finalSessionId = sessionId ?? session_id;
        if (string.IsNullOrEmpty(finalSessionId))
            return BadRequest(new { message = "sessionId is required." });

        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdString))
            return Unauthorized();

        try
        {
            var options = new SessionGetOptions();
            options.AddExpand("line_items");
            
            var sessionService = new SessionService();
            var session = await sessionService.GetAsync(finalSessionId, options, cancellationToken: ct);
            
            string? planName = null;
            var priceId = session.LineItems?.Data?.FirstOrDefault()?.Price?.Id;
            
            if (!string.IsNullOrEmpty(priceId))
            {
                var pricePlanMap = _configuration
                    .GetSection("Stripe:PricePlanMap")
                    .GetChildren()
                    .ToDictionary(c => c.Key, c => c.Value ?? string.Empty);

                if (pricePlanMap.TryGetValue(priceId, out var mappedPlanName))
                {
                    planName = mappedPlanName;
                }
            }

            return Ok(new 
            { 
                status = session.Status, 
                customerEmail = session.CustomerDetails?.Email,
                plan = planName
            });
        }
        catch (StripeException e)
        {
            _logger.LogError(e, "Stripe API error fetching session {SessionId}", finalSessionId);
            return StatusCode(500, new { message = e.StripeError.Message });
        }
    }

    [HttpPost("create-portal-session")]
    [Authorize]
    public async Task<IActionResult> CreatePortalSession(CancellationToken ct)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdString, out var userId))
            return Unauthorized();

        var user = await _dbContext.Usuarios.FirstOrDefaultAsync(u => u.Id == userId, ct);
        if (user == null || string.IsNullOrEmpty(user.StripeCustomerId))
            return BadRequest(new { message = "Usuario no tiene un Stripe Customer ID asociado." });

        try
        {
            var frontendUrl = _configuration["FrontendUrl"] ?? "http://localhost:3000";
            var options = new Stripe.BillingPortal.SessionCreateOptions
            {
                Customer = user.StripeCustomerId,
                ReturnUrl = frontendUrl.TrimEnd('/') + "/#/admin/settings",
            };

            var service = new Stripe.BillingPortal.SessionService();
            var session = await service.CreateAsync(options, cancellationToken: ct);

            return Ok(new { url = session.Url });
        }
        catch (StripeException e)
        {
            _logger.LogError(e, "Stripe Portal API error");
            return StatusCode(500, new { message = e.StripeError?.Message ?? e.Message });
        }
    }

    [HttpPost("sync")]
    [Authorize]
    public async Task<IActionResult> SyncSubscription(CancellationToken ct)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdString, out var userId))
            return Unauthorized();

        var user = await _dbContext.Usuarios.FirstOrDefaultAsync(u => u.Id == userId, ct);
        if (user == null || string.IsNullOrEmpty(user.StripeCustomerId))
            return BadRequest(new { message = "Usuario no tiene un Stripe Customer ID asociado." });

        try
        {
            var subService = new SubscriptionService();
            var options = new SubscriptionListOptions
            {
                Customer = user.StripeCustomerId,
                Status = "all",
                Limit = 1
            };
            
            var subscriptions = await subService.ListAsync(options, cancellationToken: ct);
            var activeSub = subscriptions.FirstOrDefault(s => s.Status == "active" || s.Status == "trialing")
                            ?? subscriptions.FirstOrDefault();

            if (activeSub != null)
            {
                var pricePlanMap = _configuration
                    .GetSection("Stripe:PricePlanMap")
                    .GetChildren()
                    .ToDictionary(c => c.Key, c => c.Value ?? string.Empty);

                await HandleSubscriptionActivatedAsync(user.StripeCustomerId, activeSub.Id, pricePlanMap);
            }

            return Ok(new { message = "Suscripción sincronizada." });
        }
        catch (StripeException e)
        {
            _logger.LogError(e, "Stripe API error during sync for user {UserId}", userId);
            return StatusCode(500, new { message = e.StripeError?.Message ?? e.Message });
        }
    }

    [HttpPost("webhook")]
    [AllowAnonymous]
    public async Task<IActionResult> Webhook()
    {
        var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();
        
        try
        {
            var signatureHeader = Request.Headers["Stripe-Signature"];
            var webhookSecret = _configuration["Stripe:WebhookSecret"];
            
            var stripeEvent = EventUtility.ConstructEvent(json, signatureHeader, webhookSecret);

            // ── Build price-id → plan-name map from configuration ──────────────
            // Configured in appsettings / env as Stripe:PricePlanMap:{priceId}={planName}
            var pricePlanMap = _configuration
                .GetSection("Stripe:PricePlanMap")
                .GetChildren()
                .ToDictionary(c => c.Key, c => c.Value ?? string.Empty);

            if (stripeEvent.Type == "checkout.session.completed")
            {
                // Fires immediately after successful payment — best signal for first subscription
                var session = stripeEvent.Data.Object as Stripe.Checkout.Session;
                var customerId = session?.CustomerId;
                var subscriptionId = session?.SubscriptionId;

                if (customerId != null && subscriptionId != null)
                {
                    await HandleSubscriptionActivatedAsync(customerId, subscriptionId, pricePlanMap, isCheckout: true);
                }
            }
            else if (stripeEvent.Type == "invoice.paid")
            {
                // Fires on every renewal — keeps status and period end in sync
                var invoice = stripeEvent.Data.Object as Stripe.Invoice;
                var customerId = invoice?.CustomerId;
                var subscriptionId = invoice?.Lines?.FirstOrDefault()?.SubscriptionId;

                if (customerId != null && subscriptionId != null)
                {
                    await HandleSubscriptionActivatedAsync(customerId, subscriptionId, pricePlanMap);
                }
            }
            else if (stripeEvent.Type == "customer.subscription.created" || stripeEvent.Type == "customer.subscription.updated")
            {
                var subscription = stripeEvent.Data.Object as Stripe.Subscription;
                var customerId = subscription?.CustomerId;
                var subscriptionId = subscription?.Id;

                if (customerId != null && subscriptionId != null)
                {
                    await HandleSubscriptionActivatedAsync(customerId, subscriptionId, pricePlanMap);
                }
            }
            else if (stripeEvent.Type == "customer.subscription.deleted")
            {
                // Subscription cancelled — mark as canceled in DB
                var subscription = stripeEvent.Data.Object as Stripe.Subscription;
                var customerId = subscription?.CustomerId;

                if (customerId != null)
                {
                    var user = await _dbContext.Usuarios.FirstOrDefaultAsync(u => u.StripeCustomerId == customerId);
                    if (user != null)
                    {
                        user.UpdateStripeSubscription(null, "canceled", null);
                        user.AsignarPlan(Guid.Parse("5F1F3417-402F-4CAC-AE39-F9802A5E72D2"));

                        // Revert all team members/invitees of this user to Freemium
                        var invitees = await _dbContext.Usuarios
                            .Where(u => u.TitularId == user.Id)
                            .ToListAsync();
                        foreach (var invitee in invitees)
                        {
                            invitee.RemoverTitular();
                            invitee.AsignarPlan(Guid.Parse("5F1F3417-402F-4CAC-AE39-F9802A5E72D2"));
                        }

                        await _dbContext.SaveChangesAsync();
                        _logger.LogInformation("Webhook: User {UserId} subscription canceled, reverted user and team to Freemium.", user.Id);
                    }
                }
            }

            return Ok();
        }
        catch (StripeException e)
        {
            _logger.LogError(e, "Stripe webhook signature validation failed. Header: {Signature}, Error: {Message}", Request.Headers["Stripe-Signature"], e.Message);
            return BadRequest();
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Error processing Stripe webhook: {Message}", e.Message);
            return StatusCode(500);
        }
    }

    /// <summary>
    /// Shared logic for checkout.session.completed and invoice.paid:
    /// fetches the Stripe subscription, maps the price to a local PlanSuscripcion,
    /// and updates the user record.
    /// </summary>
    private async Task HandleSubscriptionActivatedAsync(
        string customerId,
        string subscriptionId,
        Dictionary<string, string> pricePlanMap,
        bool isCheckout = false)
    {
        var user = await _dbContext.Usuarios
            .FirstOrDefaultAsync(u => u.StripeCustomerId == customerId);

        if (user == null)
        {
            _logger.LogWarning("Webhook: No user found for Stripe customer {CustomerId}.", customerId);
            return;
        }

        var subService = new SubscriptionService();
        var subscription = await subService.GetAsync(subscriptionId);

        // Determine the Stripe price ID from the first subscription item
        var priceId = subscription.Items?.Data?.FirstOrDefault()?.Price?.Id;

        if (!string.IsNullOrEmpty(priceId) && pricePlanMap.TryGetValue(priceId, out var planName))
        {
            // Look up the local PlanSuscripcion by name and assign it
            var plan = await _dbContext.PlanesSuscripcion
                .FirstOrDefaultAsync(p => p.NombrePlan == planName);

            if (plan != null)
            {
                var recurringInterval = subscription.Items?.Data?.FirstOrDefault()?.Price?.Recurring?.Interval;
                var interval = !string.IsNullOrEmpty(recurringInterval) ? recurringInterval : "monthly";
                var oldPlanId = user.PlanSuscripcionId;
                var oldInterval = user.PendingBillingCycle;

                user.AsignarPlan(plan.Idsuscripcion);
                user.SetPendingPlan(user.PendingPlanCode, interval);

                bool isNewPlan = (oldPlanId != plan.Idsuscripcion) || (oldInterval != interval) || isCheckout;
                await ProcessSubscriptionNotificationAsync(user, plan, isNewPlan, interval);
                
                _logger.LogInformation(
                    "Webhook: Assigned plan '{PlanName}' (priceId={PriceId}) to user {UserId}.",
                    planName, priceId, user.Id);

                // Enforce team member limit for the new plan
                int maxInvitees = plan.NombrePlan == "Corporativo" ? 10 : (plan.NombrePlan == "Empresa" ? 5 : 0);
                var currentInvitees = await _dbContext.Usuarios
                    .Where(usr => usr.TitularId == user.Id)
                    .ToListAsync();

                if (currentInvitees.Count > maxInvitees)
                {
                    var excessInvitees = currentInvitees.Skip(maxInvitees).ToList();
                    foreach (var invitee in excessInvitees)
                    {
                        invitee.RemoverTitular();
                        invitee.AsignarPlan(Guid.Parse("5F1F3417-402F-4CAC-AE39-F9802A5E72D2"));
                    }
                }
            }
            else
            {
                _logger.LogWarning(
                    "Webhook: Price {PriceId} mapped to plan '{PlanName}' but no matching PlanSuscripcion found.",
                    priceId, planName);
            }
        }
        else if (!string.IsNullOrEmpty(priceId))
        {
            _logger.LogWarning(
                "Webhook: Price {PriceId} has no mapping in Stripe:PricePlanMap — plan not updated.", priceId);
        }

        var currentPeriodEnd = subscription.Items?.Data?.FirstOrDefault()?.CurrentPeriodEnd ?? DateTime.UtcNow.AddMonths(1);

        // Always sync the Stripe subscription fields
        user.UpdateStripeSubscription(subscription.Id, subscription.Status, currentPeriodEnd);
        
        if (subscription.CancelAtPeriodEnd)
        {
            user.SetCancellationScheduled(subscription.CancelAt);
        }
        else
        {
            user.ClearCancellationScheduled();
        }

        await _dbContext.SaveChangesAsync();

        _logger.LogInformation(
            "Webhook: User {UserId} subscription status='{Status}', periodEnd={PeriodEnd}.",
            user.Id, subscription.Status, currentPeriodEnd);
    }

    internal async Task ProcessSubscriptionNotificationAsync(Usuario user, PlanSuscripcion plan, bool isNewPlan, string interval)
    {
        if (isNewPlan)
        {
            var notification = new Notificacion(
                user.Id,
                $"¡Felicidades! Has contratado exitosamente el plan de suscripción {plan.NombrePlan}.",
                "Success",
                "/settings/subscription"
            );
            _dbContext.Notificaciones.Add(notification);
            
            // Send the email
            await _emailService.SendSubscriptionActivatedAsync(
                user.Email,
                user.NombreCompleto,
                plan.NombrePlan,
                interval
            );
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

        var user = await _dbContext.Usuarios.FirstOrDefaultAsync(u => u.StripeCustomerId == request.StripeCustomerId, ct);
        if (user == null)
        {
            return NotFound(new { message = $"Usuario con Stripe Customer ID {request.StripeCustomerId} no encontrado." });
        }

        try
        {
            var subService = new SubscriptionService();
            var options = new SubscriptionListOptions
            {
                Customer = request.StripeCustomerId,
                Status = "all",
                Limit = 1
            };
            
            var subscriptions = await subService.ListAsync(options, cancellationToken: ct);
            var activeSub = subscriptions.FirstOrDefault(s => s.Status == "active" || s.Status == "trialing")
                            ?? subscriptions.FirstOrDefault();

            if (activeSub == null)
            {
                return BadRequest(new { message = $"No Stripe subscriptions found for customer {request.StripeCustomerId}." });
            }

            var pricePlanMap = _configuration
                .GetSection("Stripe:PricePlanMap")
                .GetChildren()
                .ToDictionary(c => c.Key, c => c.Value ?? string.Empty);

            await HandleSubscriptionActivatedAsync(request.StripeCustomerId, activeSub.Id, pricePlanMap);

            return Ok(new { 
                message = "Suscripción reconciliada exitosamente.",
                subscriptionId = activeSub.Id,
                status = activeSub.Status,
                periodEnd = activeSub.Items?.Data?.FirstOrDefault()?.CurrentPeriodEnd
            });
        }
        catch (StripeException e)
        {
            _logger.LogError(e, "Stripe API error during subscription reconciliation for Customer {CustomerId}", request.StripeCustomerId);
            return StatusCode(500, new { message = e.StripeError?.Message ?? e.Message });
        }
    }

    private Task<bool> IsAdminAsync()
    {
        if (User?.Identity?.IsAuthenticated != true)
        {
            return Task.FromResult(false);
        }

        var roles = User.Claims
            .Where(c => c.Type == System.Security.Claims.ClaimTypes.Role || c.Type == "role")
            .Select(c => c.Value)
            .ToList();

        return Task.FromResult(roles.Any(r => 
            string.Equals(r, "admin", StringComparison.OrdinalIgnoreCase) || 
            string.Equals(r, "Administrator", StringComparison.OrdinalIgnoreCase)));
    }

    [HttpPost("cancel")]
    [Authorize]
    public async Task<IActionResult> CancelSubscription([FromServices] Application.Abstractions.IStripeService stripeService, CancellationToken ct)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdString, out var userId)) return Unauthorized();

        var user = await _dbContext.Usuarios.FirstOrDefaultAsync(u => u.Id == userId, ct);
        if (user == null || string.IsNullOrEmpty(user.StripeSubscriptionId))
            return BadRequest(new { message = "Suscripción no encontrada o no gestionada por Stripe." });

        try
        {
            var cancelAt = await stripeService.CancelAtPeriodEndAsync(user.StripeSubscriptionId, ct);
            
            user.SetCancellationScheduled(cancelAt);
            await _dbContext.SaveChangesAsync(ct);

            return Ok(new { message = "Cancelación programada." });
        }
        catch (StripeException e)
        {
            _logger.LogError(e, "Stripe error cancelling subscription.");
            return StatusCode(500, new { message = e.StripeError?.Message ?? e.Message });
        }
    }

    [HttpPost("reactivate")]
    [Authorize]
    public async Task<IActionResult> ReactivateSubscription([FromServices] Application.Abstractions.IStripeService stripeService, CancellationToken ct)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdString, out var userId)) return Unauthorized();

        var user = await _dbContext.Usuarios.FirstOrDefaultAsync(u => u.Id == userId, ct);
        if (user == null || string.IsNullOrEmpty(user.StripeSubscriptionId))
            return BadRequest(new { message = "Suscripción no encontrada." });

        if (!user.CancelAtPeriodEnd)
            return BadRequest(new { message = "La suscripción no está en proceso de cancelación." });

        try
        {
            await stripeService.ReactivateSubscriptionAsync(user.StripeSubscriptionId, ct);
            
            user.ClearCancellationScheduled();
            await _dbContext.SaveChangesAsync(ct);

            return Ok(new { message = "Suscripción reactivada exitosamente." });
        }
        catch (StripeException e)
        {
            _logger.LogError(e, "Stripe error reactivating subscription.");
            return StatusCode(500, new { message = e.StripeError?.Message ?? e.Message });
        }
    }
}

public class ReconcileRequest
{
    public string StripeCustomerId { get; set; } = string.Empty;
}
