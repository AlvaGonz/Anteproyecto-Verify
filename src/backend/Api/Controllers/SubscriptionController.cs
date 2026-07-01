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

namespace Api.Controllers;

[ApiController]
[Route("api/v1/subscriptions")]
public class SubscriptionController : ControllerBase
{
    private readonly AppDbContext _dbContext;
    private readonly IConfiguration _configuration;
    private readonly ILogger<SubscriptionController> _logger;

    public SubscriptionController(AppDbContext dbContext, IConfiguration configuration, ILogger<SubscriptionController> logger)
    {
        _dbContext = dbContext;
        _configuration = configuration;
        _logger = logger;
        StripeConfiguration.ApiKey = _configuration["Stripe:SecretKey"];
    }

    [HttpPost("create-session")]
    [Authorize]
    public async Task<IActionResult> CreateSession([FromBody] CreateSessionRequest request, CancellationToken ct)
    {
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
                ReturnUrl = frontendUrl.TrimEnd('/') + "/checkout/return?session_id={CHECKOUT_SESSION_ID}",
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

        return Ok(new
        {
            plan = user.Plan?.NombrePlan,
            planPrice = user.Plan?.Precio,
            subscriptionStatus = effectiveStatus,
            currentPeriodEnd = user.CurrentPeriodEnd,
            stripeSubscriptionId = user.StripeSubscriptionId,
            isManagedByStripe = !string.IsNullOrEmpty(user.StripeSubscriptionId)
        });
    }

    [HttpGet("session-status")]
    [Authorize]
    public async Task<IActionResult> GetSessionStatus([FromQuery] string session_id, CancellationToken ct)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdString))
            return Unauthorized();

        try
        {
            var sessionService = new SessionService();
            var session = await sessionService.GetAsync(session_id, cancellationToken: ct);
            return Ok(new { status = session.Status, customerEmail = session.CustomerDetails?.Email });
        }
        catch (StripeException e)
        {
            _logger.LogError(e, "Stripe API error fetching session {SessionId}", session_id);
            return StatusCode(500, new { message = e.StripeError.Message });
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

            if (stripeEvent.Type == "invoice.paid")
            {
                var invoice = stripeEvent.Data.Object as Stripe.Invoice;
                var customerId = invoice?.CustomerId;
                var subscriptionId = invoice?.Lines?.FirstOrDefault()?.SubscriptionId;
                
                if (customerId != null)
                {
                    var user = await _dbContext.Usuarios.FirstOrDefaultAsync(u => u.StripeCustomerId == customerId);
                    if (user != null)
                    {
                        // Update to Professional as base - logic can be improved based on price
                        user.UpdateRol(Domain.Enums.UserRole.Profesional);
                        
                        // Retrieve the subscription to get the period end
                        if (subscriptionId != null)
                        {
                            var subService = new SubscriptionService();
                            var subscription = await subService.GetAsync(subscriptionId);
                            user.UpdateStripeSubscription(subscription.Id, subscription.Status, invoice?.PeriodEnd);
                        }
                        
                        await _dbContext.SaveChangesAsync();
                        _logger.LogInformation("Webhook: User {UserId} subscription activated.", user.Id);
                    }
                }
            }

            return Ok();
        }
        catch (StripeException e)
        {
            _logger.LogError(e, "Stripe webhook signature validation failed.");
            return BadRequest();
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Error processing Stripe webhook.");
            return StatusCode(500);
        }
    }
}
