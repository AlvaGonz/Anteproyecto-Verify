using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Notifications;
using Application.Abstractions.Persistence;
using Application.Common.Exceptions;
using Application.Contracts.Subscriptions;
using Application.DTOs.Subscriptions;
using Domain.Entities;
using Domain.Enums;
using Domain.Policies;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Stripe;
using Stripe.Checkout;

namespace Infrastructure.Services;

public class SubscriptionService : ISubscriptionService
{
    private readonly AppDbContext _dbContext;
    private readonly IConfiguration _configuration;
    private readonly ILogger<SubscriptionService> _logger;
    private readonly IEmailService _emailService;
    private readonly INotificationFactory _notificationFactory;
    private readonly INotificacionRepository _notificacionRepository;

    public SubscriptionService(
        AppDbContext dbContext,
        IConfiguration configuration,
        ILogger<SubscriptionService> logger,
        IEmailService emailService,
        INotificationFactory notificationFactory,
        INotificacionRepository notificacionRepository)
    {
        _dbContext = dbContext;
        _configuration = configuration;
        _logger = logger;
        _emailService = emailService;
        _notificationFactory = notificationFactory;
        _notificacionRepository = notificacionRepository;
        StripeConfiguration.ApiKey = _configuration["Stripe:SecretKey"];
    }

    public async Task<string> CreateSessionAsync(Guid userId, CreateSessionRequest request, string frontendUrl, CancellationToken ct = default)
    {
        var user = await _dbContext.Usuarios.FirstOrDefaultAsync(u => u.Id == userId, ct);
        if (user == null)
            throw new NotFoundException("User not found.");

        if (string.IsNullOrEmpty(_configuration["Stripe:SecretKey"]))
            throw new BadRequestException("Stripe Secret Key is not configured on the server.");

        if (!string.IsNullOrEmpty(request.PlanCode) || !string.IsNullOrEmpty(request.BillingCycle))
        {
            user.SetPendingPlan(request.PlanCode ?? user.PendingPlanCode, request.BillingCycle ?? user.PendingBillingCycle);
            await _dbContext.SaveChangesAsync(ct);
        }

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

        return session.ClientSecret;
    }

    public async Task<MySubscriptionStatusDto> GetMySubscriptionStatusAsync(Guid userId, CancellationToken ct = default)
    {
        var user = await _dbContext.Usuarios
            .Include(u => u.Plan)
            .Include(u => u.Titular)
                .ThenInclude(t => t!.Plan)
            .FirstOrDefaultAsync(u => u.Id == userId, ct);

        if (user == null)
            throw new NotFoundException("User not found.");

        var realConsultasUsadas = await _dbContext.LogConsultas.CountAsync(lc => lc.UsuarioId == userId, ct);
        var realProyectosCreados = await _dbContext.Proyectos.CountAsync(p => p.UsuarioCreadorId == userId, ct);

        var hasPlan = user.Plan != null;
        var effectiveStatus = user.SubscriptionStatus
            ?? (hasPlan ? "active" : null);

        var isFree = hasPlan && user.Plan!.Precio == 0m;
        if (isFree && effectiveStatus == "active")
            effectiveStatus = "free";

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
                var subService = new Stripe.SubscriptionService();
                var sub = await subService.GetAsync(user.StripeSubscriptionId, cancellationToken: ct);
                if (sub != null && sub.Items.Data.Count > 0)
                {
                    billingCycle = sub.Items.Data[0].Price.Recurring.Interval switch
                    {
                        "year" => "yearly",
                        "month" => "monthly",
                        var x => x
                    };
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Could not fetch Stripe subscription for User {UserId}", user.Id);
            }
        }

        var effectivePlan = SubscriptionTierPolicy.GetEffectivePlan(user);

        return new MySubscriptionStatusDto
        {
            Plan = user.Plan?.NombrePlan,
            PlanPrice = user.Plan?.Precio,
            SubscriptionStatus = effectiveStatus,
            CurrentPeriodEnd = user.CurrentPeriodEnd,
            CancelAtPeriodEnd = user.CancelAtPeriodEnd,
            CancelAt = user.CancelAt,
            StripeSubscriptionId = user.StripeSubscriptionId,
            IsManagedByStripe = !string.IsNullOrEmpty(user.StripeSubscriptionId),
            BillingCycle = !string.IsNullOrEmpty(user.PendingBillingCycle) ? user.PendingBillingCycle : billingCycle,
            IsGuest = user.TitularId != null,
            InviterPlan = user.Titular?.Plan?.NombrePlan,
            InviterName = user.Titular?.NombreCompleto,
            PlanLimits = effectivePlan != null ? new PlanLimitsDto
            {
                MaxConsultas = effectivePlan.MaxConsultas,
                MaxProyectos = effectivePlan.MaxProyectos,
                PresentacionPublica = effectivePlan.PresentacionPublica,
                QrIncluido = effectivePlan.QrIncluido,
                MaxUsuariosSecundarios = effectivePlan.MaxUsuariosSecundarios,
                MaxAlmacenamientoMb = effectivePlan.MaxAlmacenamientoMb,
                AlertasTiempoReal = effectivePlan.AlertasTiempoRealDisponible,
                ModeloLm = effectivePlan.ModeloLmDisponible,
                ValidacionLote = effectivePlan.ValidacionLoteDisponible,
                ExportacionExcel = effectivePlan.ExportacionExcelDisponible,
                ExportacionPdf = effectivePlan.ExportacionPdfDisponible,
                IntegracionCrm = effectivePlan.IntegracionCrmDisponible,
                SoporteTipo = effectivePlan.SoporteTipo,
                AccesoApi = effectivePlan.AccesoApi,
                ConsultasUsadas = realConsultasUsadas,
                ProyectosCreados = realProyectosCreados
            } : null
        };
    }

    public async Task<SessionStatusDto> GetSessionStatusAsync(Guid userId, string sessionId, CancellationToken ct = default)
    {
        if (string.IsNullOrEmpty(_configuration["Stripe:SecretKey"]))
            throw new BadRequestException("Stripe Secret Key is not configured on the server.");

        var options = new SessionGetOptions();
        options.AddExpand("line_items");
        
        var sessionService = new SessionService();
        var session = await sessionService.GetAsync(sessionId, options, cancellationToken: ct);
        
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

        return new SessionStatusDto 
        { 
            Status = session.Status, 
            CustomerEmail = session.CustomerDetails?.Email,
            Plan = planName
        };
    }

    public async Task<string> CreatePortalSessionAsync(Guid userId, string frontendUrl, CancellationToken ct = default)
    {
        var user = await _dbContext.Usuarios.FirstOrDefaultAsync(u => u.Id == userId, ct);
        if (user == null || string.IsNullOrEmpty(user.StripeCustomerId))
            throw new BadRequestException("Usuario no tiene un Stripe Customer ID asociado.");

        var options = new Stripe.BillingPortal.SessionCreateOptions
        {
            Customer = user.StripeCustomerId,
            ReturnUrl = frontendUrl.TrimEnd('/') + "/#/admin/settings",
        };

        var service = new Stripe.BillingPortal.SessionService();
        var session = await service.CreateAsync(options, cancellationToken: ct);

        return session.Url;
    }

    public async Task SyncSubscriptionAsync(Guid userId, CancellationToken ct = default)
    {
        var user = await _dbContext.Usuarios.FirstOrDefaultAsync(u => u.Id == userId, ct);
        if (user == null || string.IsNullOrEmpty(user.StripeCustomerId))
            throw new BadRequestException("Usuario no tiene un Stripe Customer ID asociado.");

        var subService = new Stripe.SubscriptionService();
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
    }

    public async Task HandleWebhookAsync(string json, string signatureHeader, CancellationToken ct = default)
    {
        var webhookSecret = _configuration["Stripe:WebhookSecret"];
        var stripeEvent = EventUtility.ConstructEvent(json, signatureHeader, webhookSecret);

        var pricePlanMap = _configuration
            .GetSection("Stripe:PricePlanMap")
            .GetChildren()
            .ToDictionary(c => c.Key, c => c.Value ?? string.Empty);

        if (stripeEvent.Type == "checkout.session.completed")
        {
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
            var invoice = stripeEvent.Data.Object as Stripe.Invoice;
            var customerId = invoice?.CustomerId;
            var subscriptionId = invoice?.Lines?.FirstOrDefault()?.SubscriptionId;

            if (customerId != null && subscriptionId != null)
            {
                await HandleSubscriptionActivatedAsync(customerId, subscriptionId, pricePlanMap);
            }
        }
        else if (stripeEvent.Type == "invoice.payment_failed")
        {
            var invoice = stripeEvent.Data.Object as Stripe.Invoice;
            var customerId = invoice?.CustomerId;
            if (customerId != null)
            {
                var user = await _dbContext.Usuarios.FirstOrDefaultAsync(u => u.StripeCustomerId == customerId);
                if (user != null)
                {
                    var notif = await _notificationFactory.CreateAsync(user.Id,
                        TipoNotificacionId.PagoFallido,
                        "El pago de tu suscripción ha fallado. Por favor actualiza tu método de pago para evitar la cancelación.",
                        "/settings/subscription");
                    await _notificacionRepository.AddAsync(notif);
                    await _dbContext.SaveChangesAsync();
                }
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
            var subscription = stripeEvent.Data.Object as Stripe.Subscription;
            var customerId = subscription?.CustomerId;

            if (customerId != null)
            {
                var user = await _dbContext.Usuarios.FirstOrDefaultAsync(u => u.StripeCustomerId == customerId);
                if (user != null)
                {
                    user.UpdateStripeSubscription(null, "canceled", null);
                    user.AsignarPlan(Guid.Parse("5F1F3417-402F-4CAC-AE39-F9802A5E72D2"));

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

                    var notif = await _notificationFactory.CreateAsync(user.Id,
                        TipoNotificacionId.SuscripcionCancelada,
                        "Tu suscripción ha sido cancelada. Has sido movido al plan gratuito.",
                        "/settings/subscription");
                    await _notificacionRepository.AddAsync(notif);
                    await _dbContext.SaveChangesAsync();
                }
            }
        }
    }

    public async Task<ReconcileResponseDto> ReconcileSubscriptionAsync(string stripeCustomerId, CancellationToken ct = default)
    {
        var user = await _dbContext.Usuarios.FirstOrDefaultAsync(u => u.StripeCustomerId == stripeCustomerId, ct);
        if (user == null)
            throw new NotFoundException($"Usuario con Stripe Customer ID {stripeCustomerId} no encontrado.");

        var subService = new Stripe.SubscriptionService();
        var options = new SubscriptionListOptions
        {
            Customer = stripeCustomerId,
            Status = "all",
            Limit = 1
        };
        
        var subscriptions = await subService.ListAsync(options, cancellationToken: ct);
        var activeSub = subscriptions.FirstOrDefault(s => s.Status == "active" || s.Status == "trialing")
                        ?? subscriptions.FirstOrDefault();

        if (activeSub == null)
            throw new NotFoundException($"No Stripe subscriptions found for customer {stripeCustomerId}.");

        var pricePlanMap = _configuration
            .GetSection("Stripe:PricePlanMap")
            .GetChildren()
            .ToDictionary(c => c.Key, c => c.Value ?? string.Empty);

        await HandleSubscriptionActivatedAsync(stripeCustomerId, activeSub.Id, pricePlanMap);

        return new ReconcileResponseDto 
        { 
            Message = "Suscripción reconciliada exitosamente.",
            SubscriptionId = activeSub.Id,
            Status = activeSub.Status,
            PeriodEnd = activeSub.Items?.Data?.FirstOrDefault()?.CurrentPeriodEnd
        };
    }

    public async Task<DateTime?> CancelSubscriptionAsync(Guid userId, CancellationToken ct = default)
    {
        var user = await _dbContext.Usuarios.FirstOrDefaultAsync(u => u.Id == userId, ct);
        if (user == null || string.IsNullOrEmpty(user.StripeSubscriptionId))
            throw new NotFoundException("Suscripción no encontrada o no gestionada por Stripe.");

        var subService = new Stripe.SubscriptionService();
        var subscription = await subService.GetAsync(user.StripeSubscriptionId, cancellationToken: ct);

        var cancelOptions = new SubscriptionUpdateOptions
        {
            CancelAtPeriodEnd = true
        };
        var updatedSub = await subService.UpdateAsync(user.StripeSubscriptionId, cancelOptions, cancellationToken: ct);

        var cancelAt = updatedSub.CancelAt;
        user.SetCancellationScheduled(cancelAt);
        await _dbContext.SaveChangesAsync(ct);

        var notif = await _notificationFactory.CreateAsync(user.Id,
            TipoNotificacionId.SuscripcionCancelada,
            $"Tu suscripción será cancelada el {cancelAt?.ToLocalTime():dd/MM/yyyy}. Puedes reactivarla antes de esa fecha.",
            "/settings/subscription");
        await _notificacionRepository.AddAsync(notif, ct);
        await _dbContext.SaveChangesAsync(ct);

        return cancelAt;
    }

    public async Task ReactivateSubscriptionAsync(Guid userId, CancellationToken ct = default)
    {
        var user = await _dbContext.Usuarios.FirstOrDefaultAsync(u => u.Id == userId, ct);
        if (user == null || string.IsNullOrEmpty(user.StripeSubscriptionId))
            throw new NotFoundException("Suscripción no encontrada.");

        if (!user.CancelAtPeriodEnd)
            throw new BadRequestException("La suscripción no está en proceso de cancelación.");

        var subService = new Stripe.SubscriptionService();
        var updateOptions = new SubscriptionUpdateOptions
        {
            CancelAtPeriodEnd = false
        };
        await subService.UpdateAsync(user.StripeSubscriptionId, updateOptions, cancellationToken: ct);
        
        user.ClearCancellationScheduled();
        await _dbContext.SaveChangesAsync(ct);
    }

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

        var subService = new Stripe.SubscriptionService();
        var subscription = await subService.GetAsync(subscriptionId);

        var priceId = subscription.Items?.Data?.FirstOrDefault()?.Price?.Id;

        if (!string.IsNullOrEmpty(priceId) && pricePlanMap.TryGetValue(priceId, out var planName))
        {
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

    private async Task ProcessSubscriptionNotificationAsync(Usuario user, PlanSuscripcion plan, bool isNewPlan, string interval)
    {
        if (isNewPlan)
        {
            var notification = await _notificationFactory.CreateAsync(
                user.Id,
                TipoNotificacionId.SuscripcionActivada,
                $"¡Felicidades! Has contratado exitosamente el plan de suscripción {plan.NombrePlan}.",
                "/settings/subscription");
            _dbContext.Notificaciones.Add(notification);
            
            await _emailService.SendSubscriptionActivatedAsync(
                user.Email,
                user.NombreCompleto,
                plan.NombrePlan,
                interval
            );
        }
    }
}
