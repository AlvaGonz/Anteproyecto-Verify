using Application.Abstractions.Security;
using Infrastructure.Security;
using Microsoft.Extensions.Caching.Memory;
using Xunit;

namespace UnitTests;

public class TwoFactorChallengeStoreTests
{
    private static ITwoFactorChallengeStore CreateSut()
    {
        var cache = new MemoryCache(new MemoryCacheOptions());
        return new InMemoryTwoFactorChallengeStore(cache);
    }

    [Fact]
    public async Task CreateAsync_ReturnsChallenge_WithFutureExpiry_AndMatchingUsuarioId()
    {
        var sut = CreateSut();
        var usuarioId = Guid.NewGuid();

        var challenge = await sut.CreateAsync(usuarioId);

        Assert.Equal(usuarioId, challenge.UsuarioId);
        Assert.True(challenge.ExpiresAtUtc > DateTime.UtcNow, "challenge should expire in the future");
        Assert.True(challenge.ExpiresAtUtc <= DateTime.UtcNow.AddMinutes(6), "default TTL should be ~5 minutes");
        Assert.False(string.IsNullOrWhiteSpace(challenge.ChallengeToken));
        Assert.True(challenge.ChallengeToken.Length >= 32, "challenge token should be long enough to be unguessable");
    }

    [Fact]
    public async Task ConsumeAsync_ReturnsMatchingChallenge_OnFirstCall()
    {
        var sut = CreateSut();
        var usuarioId = Guid.NewGuid();
        var created = await sut.CreateAsync(usuarioId);

        var consumed = await sut.ConsumeAsync(created.ChallengeToken);

        Assert.NotNull(consumed);
        Assert.Equal(created.UsuarioId, consumed!.UsuarioId);
        Assert.Equal(created.ChallengeToken, consumed.ChallengeToken);
    }

    [Fact]
    public async Task ConsumeAsync_ReturnsNull_OnSecondCall_SingleUse()
    {
        var sut = CreateSut();
        var created = await sut.CreateAsync(Guid.NewGuid());

        var first = await sut.ConsumeAsync(created.ChallengeToken);
        var second = await sut.ConsumeAsync(created.ChallengeToken);

        Assert.NotNull(first);
        Assert.Null(second);
    }

    [Fact]
    public async Task ConsumeAsync_ReturnsNull_ForUnknownToken()
    {
        var sut = CreateSut();
        var result = await sut.ConsumeAsync("never-issued-token");
        Assert.Null(result);
    }

    [Fact]
    public async Task CreateAsync_TwiceForSameUser_IssuesDistinctTokens()
    {
        var sut = CreateSut();
        var userId = Guid.NewGuid();

        var a = await sut.CreateAsync(userId);
        var b = await sut.CreateAsync(userId);

        Assert.NotEqual(a.ChallengeToken, b.ChallengeToken);
    }
}
