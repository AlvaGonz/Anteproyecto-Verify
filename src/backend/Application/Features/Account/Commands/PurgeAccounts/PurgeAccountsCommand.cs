namespace Application.Features.Account.Commands.PurgeAccounts;

public record PurgeAccountsCommand();

public record PurgeAccountsResult(
    bool IsSuccess,
    int PurgedCount,
    string? ErrorMessage
);
