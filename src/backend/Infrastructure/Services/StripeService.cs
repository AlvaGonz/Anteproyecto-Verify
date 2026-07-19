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
}
