namespace Application.Abstractions;

using System.Threading;
using System.Threading.Tasks;

public record StripeSubscriptionResult(
    string CustomerId,
    string SubscriptionId,
    DateTime CurrentPeriodEnd
);

public interface IStripeService
{
    Task<StripeSubscriptionResult> CreateCustomerWithSubscriptionAsync(
        string email, 
        string name, 
        string userId, 
        string priceId,
        CancellationToken ct = default);
        
    Task<DateTime?> CancelAtPeriodEndAsync(string subscriptionId, CancellationToken cancellationToken = default);
    Task ReactivateSubscriptionAsync(string subscriptionId, CancellationToken cancellationToken = default);
}
