using System;
using System.Security.Cryptography;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Security;
using Microsoft.Extensions.Caching.Memory;

namespace Infrastructure.Security;

public class InMemoryTwoFactorChallengeStore : ITwoFactorChallengeStore
{
    private const string KeyPrefix = "2fa:challenge:";
    public static readonly TimeSpan DefaultTtl = TimeSpan.FromMinutes(5);

    private readonly IMemoryCache _cache;
    private readonly TimeSpan _ttl;

    public InMemoryTwoFactorChallengeStore(IMemoryCache cache, TimeSpan? ttl = null)
    {
        _cache = cache;
        _ttl = ttl ?? DefaultTtl;
    }

    public Task<TwoFactorChallenge> CreateAsync(Guid usuarioId, CancellationToken cancellationToken = default)
    {
        var token = NewToken();
        var challenge = new TwoFactorChallenge(token, usuarioId, DateTime.UtcNow.Add(_ttl));
        _cache.Set(KeyPrefix + token, challenge, new MemoryCacheEntryOptions
        {
            AbsoluteExpiration = challenge.ExpiresAtUtc
        });
        return Task.FromResult(challenge);
    }

    public Task<TwoFactorChallenge?> ConsumeAsync(string challengeToken, CancellationToken cancellationToken = default)
    {
        var key = KeyPrefix + challengeToken;
        if (_cache.TryGetValue(key, out TwoFactorChallenge? challenge))
        {
            _cache.Remove(key);
            return Task.FromResult<TwoFactorChallenge?>(challenge);
        }
        return Task.FromResult<TwoFactorChallenge?>(null);
    }

    public Task<TwoFactorChallenge?> PeekAsync(string challengeToken, CancellationToken cancellationToken = default)
    {
        var key = KeyPrefix + challengeToken;
        if (_cache.TryGetValue(key, out TwoFactorChallenge? challenge))
        {
            return Task.FromResult<TwoFactorChallenge?>(challenge);
        }
        return Task.FromResult<TwoFactorChallenge?>(null);
    }

    private static string NewToken()
    {
        Span<byte> bytes = stackalloc byte[32];
        RandomNumberGenerator.Fill(bytes);
        return Convert.ToBase64String(bytes).TrimEnd('=').Replace('+', '-').Replace('/', '_');
    }
}
