namespace Application.Features.Auth.Commands.VerifyEmail;

using System;

public record VerifyEmailCommand(string Token);

public record VerifyEmailResultDto(
    bool IsSuccess,
    string? ErrorMessage
);
