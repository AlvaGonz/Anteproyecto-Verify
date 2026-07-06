namespace Application.Abstractions;

using System.Threading;
using System.Threading.Tasks;

public interface IStripeService
{
    Task CancelAtPeriodEndAsync(string subscriptionId, CancellationToken cancellationToken = default);
}
