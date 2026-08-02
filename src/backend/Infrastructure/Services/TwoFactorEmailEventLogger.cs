using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;

namespace Infrastructure.Services;

/// <summary>
/// Structured lifecycle event emitted by the 2FA email-OTP pipeline. Used to
/// verify the dispatch contract end-to-end and to alert on swallowed provider
/// failures. NEVER contains the OTP value, the destination email address, or
/// the provider API key — only the event name, an ISO timestamp, a hashed
/// challenge token, and an optional outcome tag.
///</summary>
public sealed record TwoFactorEmailLifecycleEvent(
    string Event,
    DateTime Ts,
    string ChallengeTokenHash,
    string? Outcome);

public interface ITwoFactorEmailEventLogger
{
    /// <summary>
    /// Records a lifecycle event. Thread-safe.
    ///</summary>
    void Record(string eventName, string challengeToken, string? outcome = null);

    /// <summary>
    /// Returns all events for the given challenge token, in chronological
    /// order. The challenge token is matched by SHA-256 hash so callers do
    /// not need to know the actual token.
    ///</summary>
    IReadOnlyList<TwoFactorEmailLifecycleEvent> GetEvents(string challengeToken);

    /// <summary>
    /// Test/development hook: when enabled, the next 2FA email-OTP send will
    /// throw a synthetic provider exception. This lets us assert that the
    /// backend pipeline does not silently look like success when the
    /// provider fails.
    ///</summary>
    bool ForceFailEnabled { get; set; }

    /// <summary>
    /// Generates a SHA-256 hash of the challenge token. Used for hashing the
    /// token for log/observability correlation without ever storing the
    /// token itself.
    ///</summary>
    static string HashChallengeToken(string challengeToken)
    {
        var bytes = Encoding.UTF8.GetBytes(challengeToken ?? string.Empty);
        var hash = SHA256.HashData(bytes);
        return Convert.ToHexString(hash);
    }
}

/// <summary>
/// In-process implementation backed by a thread-safe queue. Bounded to a
/// reasonable cap (1000 events) so a runaway test cannot exhaust memory.
///</summary>
public sealed class TwoFactorEmailEventLogger : ITwoFactorEmailEventLogger
{
    private const int Capacity = 1000;
    private readonly ConcurrentQueue<TwoFactorEmailLifecycleEvent> _events = new();
    public bool ForceFailEnabled { get; set; }

    public void Record(string eventName, string challengeToken, string? outcome = null)
    {
        var evt = new TwoFactorEmailLifecycleEvent(
            eventName,
            DateTime.UtcNow,
            ITwoFactorEmailEventLogger.HashChallengeToken(challengeToken),
            outcome);
        _events.Enqueue(evt);
        while (_events.Count > Capacity && _events.TryDequeue(out _)) { }
    }

    public IReadOnlyList<TwoFactorEmailLifecycleEvent> GetEvents(string challengeToken)
    {
        var hash = ITwoFactorEmailEventLogger.HashChallengeToken(challengeToken);
        return _events
            .Where(e => string.Equals(e.ChallengeTokenHash, hash, StringComparison.Ordinal))
            .OrderBy(e => e.Ts)
            .ToList();
    }
}
