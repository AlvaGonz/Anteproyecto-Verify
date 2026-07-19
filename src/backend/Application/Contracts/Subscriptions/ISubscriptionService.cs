namespace Application.Contracts.Subscriptions;

using System;
using System.Threading;
using System.Threading.Tasks;
using Application.DTOs.Subscriptions;

public interface ISubscriptionService
{
    Task<string> CreateSessionAsync(Guid userId, CreateSessionRequest request, string frontendUrl, CancellationToken ct = default);
    Task<MySubscriptionStatusDto> GetMySubscriptionStatusAsync(Guid userId, CancellationToken ct = default);
    Task<SessionStatusDto> GetSessionStatusAsync(Guid userId, string sessionId, CancellationToken ct = default);
    Task<string> CreatePortalSessionAsync(Guid userId, string frontendUrl, CancellationToken ct = default);
    Task SyncSubscriptionAsync(Guid userId, CancellationToken ct = default);
    Task HandleWebhookAsync(string json, string signatureHeader, CancellationToken ct = default);
    Task<ReconcileResponseDto> ReconcileSubscriptionAsync(string stripeCustomerId, CancellationToken ct = default);
    Task<DateTime?> CancelSubscriptionAsync(Guid userId, CancellationToken ct = default);
    Task ReactivateSubscriptionAsync(Guid userId, CancellationToken ct = default);
}
