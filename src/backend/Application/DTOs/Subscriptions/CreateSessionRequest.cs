namespace Application.DTOs.Subscriptions;

public record SubscriptionConsentDto(DateTime? Timestamp, string UserAgent);
public record CreateSessionRequest(string PriceId, string? PlanCode, string? BillingCycle, SubscriptionConsentDto Consent);
