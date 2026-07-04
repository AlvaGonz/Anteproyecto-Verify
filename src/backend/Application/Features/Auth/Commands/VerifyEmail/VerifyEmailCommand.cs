namespace Application.Features.Auth.Commands.VerifyEmail;

using System;

public record VerifyEmailCommand(string Token);

public record VerifyEmailResultDto(
    bool IsSuccess,
    string? ErrorMessage,
    Guid? UserId = null,
    string? NextStep = null,
    string? PendingPlanCode = null,
    string? PendingBillingCycle = null
);
