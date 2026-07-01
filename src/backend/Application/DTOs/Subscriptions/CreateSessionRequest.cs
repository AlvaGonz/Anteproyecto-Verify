namespace Application.DTOs.Subscriptions;

public record SubscriptionConsentDto(DateTime? Timestamp, string UserAgent);
public record CreateSessionRequest(string PriceId, SubscriptionConsentDto Consent);
