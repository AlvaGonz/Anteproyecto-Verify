namespace Application.Features.Auth.Commands.LoginUser;

using System;

public record LoginUserCommand(
    string Email,
    string Password
);

public record LoginUserResultDto(
    bool IsSuccess,
    string? ErrorMessage,
    LoginUserResponseDto? Data
);

public record LoginUserResponseDto(
    LoginUserUserDto User,
    string Token
);

public record LoginUserUserDto(
    Guid Id,
    string Email,
    string Name,
    string Role,
    string? AvatarUrl,
    string? SubscriptionStatus = null,
    string? PendingPlanCode = null,
    string? PendingBillingCycle = null,
    bool AceptoDescargo = false,
    bool IsGuest = false,
    Guid? TitularId = null,
    string? InviterPlan = null,
    object? InviteesList = null
);
