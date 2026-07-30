namespace Application.Abstractions.Security;

public sealed record TwoFactorChallenge(string ChallengeToken, Guid UsuarioId, DateTime ExpiresAtUtc);

public interface ITwoFactorChallengeStore
{
    Task<TwoFactorChallenge> CreateAsync(Guid usuarioId, CancellationToken cancellationToken = default);
    Task<TwoFactorChallenge?> ConsumeAsync(string challengeToken, CancellationToken cancellationToken = default);
}
