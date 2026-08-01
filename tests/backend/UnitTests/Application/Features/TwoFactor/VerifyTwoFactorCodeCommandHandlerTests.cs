using System;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions;
using Application.Abstractions.Persistence;
using Application.Abstractions.Security;
using Application.Features.TwoFactor;
using Domain.Entities;
using Domain.Enums;
using Xunit;

namespace UnitTests;

public class VerifyTwoFactorCodeCommandHandlerTests
{
    [Fact]
    public async Task UnprotectThrowsCryptographicException_ReturnsSafeFailure_NotThrow()
    {
        // Arrange: simulate lost DataProtection key ring — protector throws CryptographicException
        // when trying to decrypt the user's stored TwoFactorSecretEncrypted.
        var user = new Usuario("Test", "User", "t@example.com", "hashed", UserRole.User, "8090000000", "00100000000");
        user.Begin2FAEnrollment("stale-ciphertext-from-previous-container");
        user.Confirm2FAEnrollment("[]");

        var userId = user.Id;

        var sut = new VerifyTwoFactorCodeCommandHandler(
            new FakeChallengeStore(userId),
            new FakeUsuarioRepository(user),
            new FakeTotpService(),
            new ThrowingProtector(),
            new FakeJwtGenerator(),
            new FakeUnitOfWork(),
            new FakeAuditLogger());

        // Act + Assert: must NOT throw CryptographicException
        var result = await sut.Handle(new VerifyTwoFactorCodeCommand("ch-tok", 123456), CancellationToken.None);

        Assert.False(result.IsSuccess);
        Assert.NotNull(result.ErrorMessage);
        // The user-facing message must not leak internal exception details.
        Assert.DoesNotContain("Cryptographic", result.ErrorMessage, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("key ring", result.ErrorMessage, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("DataProtection", result.ErrorMessage, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("4b43165a", result.ErrorMessage, StringComparison.OrdinalIgnoreCase);
        Assert.Null(result.Token);
        Assert.Null(result.UsuarioId);
    }

    private sealed class ThrowingProtector : ITwoFactorSecretProtector
    {
        public string Protect(string plain) => "x";
        public string Unprotect(string protectedSecret) =>
            throw new System.Security.Cryptography.CryptographicException(
                "The key {4b43165a-a891-4238-8dc5-7a142d6abdb2} was not found in the key ring.");
    }

    private sealed class FakeUsuarioRepository : IUsuarioRepository
    {
        private readonly Usuario _u;
        public FakeUsuarioRepository(Usuario u) { _u = u; }
        public Task<Usuario?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
            Task.FromResult(_u.Id == id ? _u : null);
        public Task<Usuario?> GetByIdWithPlanAsync(Guid id, CancellationToken ct = default) =>
            Task.FromResult(_u.Id == id ? _u : null);
        public Task<Usuario?> GetByEmailAsync(string email, CancellationToken ct = default) =>
            Task.FromResult<Usuario?>(null);
        public Task AddAsync(Usuario u, CancellationToken ct = default) => Task.CompletedTask;
        public void Update(Usuario u) { }
        public Task<bool> ExistsByEmailAsync(string email, CancellationToken ct = default) => Task.FromResult(false);
        public Task<bool> ExistsByCedulaAsync(string cedula, CancellationToken ct = default) => Task.FromResult(false);
        public Task<Usuario?> GetByVerificationTokenAsync(string token, CancellationToken ct = default) => Task.FromResult<Usuario?>(null);
        public Task<Usuario?> GetByPasswordResetTokenAsync(string token, CancellationToken ct = default) => Task.FromResult<Usuario?>(null);
        public Task<List<Usuario>> GetPendingPurgeAsync(CancellationToken ct = default) => Task.FromResult(new List<Usuario>());
        public Task<Usuario?> GetByNicknameAsync(string nickname, CancellationToken ct = default) => Task.FromResult<Usuario?>(null);
        public Task IncrementarConsultaAsync(Guid userId, CancellationToken ct = default) => Task.CompletedTask;
    }

    private sealed class FakeChallengeStore : ITwoFactorChallengeStore
    {
        private readonly Guid _uid;
        public FakeChallengeStore(Guid uid) { _uid = uid; }
        public Task<TwoFactorChallenge> CreateAsync(Guid usuarioId, CancellationToken ct = default) =>
            Task.FromResult(new TwoFactorChallenge("ch-new", usuarioId, DateTime.UtcNow.AddMinutes(5)));
        public Task<TwoFactorChallenge?> ConsumeAsync(string challengeToken, CancellationToken ct = default) =>
            Task.FromResult<TwoFactorChallenge?>(null);
        public Task<TwoFactorChallenge?> PeekAsync(string challengeToken, CancellationToken ct = default) =>
            Task.FromResult<TwoFactorChallenge?>(new TwoFactorChallenge(challengeToken, _uid, DateTime.UtcNow.AddMinutes(5)));
    }

    private sealed class FakeTotpService : ITotpService
    {
        public string GenerateSecret() => "BASE32SECRETBASE32SECRETBASE32SE";
        public string BuildOtpAuthUri(string email, string secret, string issuer) => $"otpauth://totp/{email}?secret={secret}&issuer={issuer}";
        public int ComputeCode(string base32Secret, DateTime utcNow) => 123456;
        public bool ValidateCode(string base32Secret, int submittedCode, int windowSteps = 1) => true;
    }

    private sealed class FakeJwtGenerator : IJwtTokenGenerator
    {
        public string GenerateToken(Usuario user, bool mfaAuthenticated = false) => "jwt";
    }

    private sealed class FakeUnitOfWork : IUnitOfWork
    {
        public Task<int> SaveChangesAsync(CancellationToken ct = default) => Task.FromResult(1);
    }

    private sealed class FakeAuditLogger : IAuditLogger
    {
        public Task AppendAsync(AuditEntryDto entry, CancellationToken cancellationToken = default) => Task.CompletedTask;
    }
}
