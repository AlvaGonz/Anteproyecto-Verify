namespace Application.Features.Account.Commands.RecoverAccount;

using System;

public record RecoverAccountCommand(
    Guid UserId
);

public record RecoverAccountResult(
    bool IsSuccess,
    string? ErrorMessage
);
