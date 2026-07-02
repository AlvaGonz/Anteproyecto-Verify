namespace Application.Features.Auth.Commands.ResendVerificationEmail;

public record ResendVerificationEmailCommand(string Email, string? ReturnUrl = null);

public record ResendVerificationEmailResultDto(
    bool IsSuccess,
    string? ErrorMessage
);
