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
    string? AvatarUrl
);
