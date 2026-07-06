namespace Application.Features.Account.Commands.RequestAccountDeletion;

using System;

public record RequestAccountDeletionCommand(
    Guid UserId,
    string? DeletionReason
);

public record RequestAccountDeletionResult(
    bool IsSuccess,
    string? ErrorMessage
);
