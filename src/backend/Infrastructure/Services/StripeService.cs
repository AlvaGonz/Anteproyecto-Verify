namespace Infrastructure.Services;

using System;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions;
using Stripe;
using Microsoft.Extensions.Configuration;

public class StripeService : IStripeService
{
    private readonly IConfiguration _configuration;

    public StripeService(IConfiguration configuration)
    {
        _configuration = configuration;
        StripeConfiguration.ApiKey = _configuration["Stripe:SecretKey"];
    }

    public async Task<DateTime?> CancelAtPeriodEndAsync(string subscriptionId, CancellationToken cancellationToken = default)
    {
        var service = new Stripe.SubscriptionService();
        var options = new SubscriptionUpdateOptions
        {
            CancelAtPeriodEnd = true
        };
        var sub = await service.UpdateAsync(subscriptionId, options, cancellationToken: cancellationToken);
        return sub.CancelAt;
    }

    public async Task ReactivateSubscriptionAsync(string subscriptionId, CancellationToken cancellationToken = default)
    {
        var service = new Stripe.SubscriptionService();
        var options = new SubscriptionUpdateOptions
        {
            CancelAtPeriodEnd = false
        };
        await service.UpdateAsync(subscriptionId, options, cancellationToken: cancellationToken);
    }

    public async Task<StripeSubscriptionResult> CreateCustomerWithSubscriptionAsync(
        string email, 
        string name, 
        string userId, 
        string priceId,
        CancellationToken ct = default)
    {
        var _customers = new CustomerService();
        var _subscriptions = new SubscriptionService();
        
        // Crear Customer
        var customer = await _customers.CreateAsync(new CustomerCreateOptions
        {
            Email = email,
            Name = name,
            Metadata = new System.Collections.Generic.Dictionary<string, string>
                { { "internal_user_id", userId } }
        }, cancellationToken: ct);

        // Crear Subscription
        var subscription = await _subscriptions.CreateAsync(new SubscriptionCreateOptions
        {
            Customer = customer.Id,
            Items = new System.Collections.Generic.List<SubscriptionItemOptions>
                { new SubscriptionItemOptions { Price = priceId } },
            PaymentBehavior = "default_incomplete",
            Expand = new System.Collections.Generic.List<string> { "latest_invoice.payment_intent" }
        }, cancellationToken: ct);

        return new StripeSubscriptionResult(
            customer.Id,
            subscription.Id,
            DateTimeOffset.FromUnixTimeSeconds(
                subscription.CurrentPeriodEnd.ToUnixTimeSeconds()).UtcDateTime
        );
    }
}
