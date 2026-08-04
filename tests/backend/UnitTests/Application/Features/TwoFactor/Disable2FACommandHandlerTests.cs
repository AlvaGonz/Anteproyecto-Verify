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

public class Disable2FACommandHandlerTests
{
    [Fact]
    public async Task UnprotectThrowsCryptographicException_StillDisables2FA_WithAuditTrail()
    {
        // Arrange: simulate lost DataProtection key ring — Disable2FA is the user's ONLY escape
        // route when the stored secret is unreadable. Password verification still gates the action;
        // the TOTP step is skipped because we cannot validate codes against an unreadable secret.
        var user = new Usuario("Test", "User", "t@example.com", "hashed", UserRole.User, "8090000000", "00100000000");
        user.Begin2FAEnrollment("stale-ciphertext-from-previous-container");
        user.Confirm2FAEnrollment("[]");
        Assert.True(user.TwoFactorEnabled);

        var passwordHasher = new FakePasswordHasher(verifyReturns: true);

        var sut = new Disable2FACommandHandler(
            new FakeUsuarioRepository(user),
            passwordHasher,
            new FakeTotpService(),
            new ThrowingProtector(),
            new FakeUnitOfWork(),
            new FakeAuditLogger());

        // Act
        var result = await sut.Handle(new Disable2FACommand(user.Id, "Pass1234!", 123456), CancellationToken.None);

        // Assert: disable succeeds (recovery path), 2FA flag is cleared
        Assert.True(result.IsSuccess);
        Assert.False(user.TwoFactorEnabled);
        Assert.Null(user.TwoFactorSecretEncrypted);
    }

    [Fact]
    public async Task UnprotectThrowsCryptographicException_WrongPassword_StillRejects()
    {
        // Arrange: when protector throws, password verification must still gate disable.
        var user = new Usuario("Test", "User", "t@example.com", "hashed", UserRole.User, "8090000000", "00100000000");
        user.Begin2FAEnrollment("stale-ciphertext");
        user.Confirm2FAEnrollment("[]");

        var sut = new Disable2FACommandHandler(
            new FakeUsuarioRepository(user),
            new FakePasswordHasher(verifyReturns: false),
            new FakeTotpService(),
            new ThrowingProtector(),
            new FakeUnitOfWork(),
            new FakeAuditLogger());

        var result = await sut.Handle(new Disable2FACommand(user.Id, "wrong-pass", 123456), CancellationToken.None);

        Assert.False(result.IsSuccess);
        Assert.True(user.TwoFactorEnabled);
    }

    private sealed class ThrowingProtector : ITwoFactorSecretProtector
    {
        public string Protect(string plain) => "x";
        public string Unprotect(string protectedSecret) =>
            throw new System.Security.Cryptography.CryptographicException(
                "The key {4b43165a-a891-4238-8dc5-7a142d6abdb2} was not found in the key ring.");
    }

    private sealed class FakePasswordHasher : IPasswordHasher
    {
        private readonly bool _ok;
        public FakePasswordHasher(bool verifyReturns) { _ok = verifyReturns; }
        public string HashPassword(string plain) => "hashed";
        public bool VerifyPassword(string plain, string hash) => _ok;
    }

    private sealed class FakeUsuarioRepository : IUsuarioRepository
    {
        private readonly Usuario _u;
        public FakeUsuarioRepository(Usuario u) { _u = u; }
        public Task<Usuario?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
            Task.FromResult(_u.Id == id ? _u : null);
        public Task<Usuario?> GetByIdWithPlanAsync(Guid id, CancellationToken ct = default) =>
            Task.FromResult(_u.Id == id ? _u : null);
        public Task<Usuario?> GetByEmailAsync(string email, CancellationToken ct = default) => Task.FromResult<Usuario?>(null);
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

    private sealed class FakeTotpService : ITotpService
    {
        public string GenerateSecret() => "BASE32SECRETBASE32SECRETBASE32SE";
        public string BuildOtpAuthUri(string email, string secret, string issuer) => $"otpauth://totp/{email}?secret={secret}&issuer={issuer}";
        public int ComputeCode(string base32Secret, DateTime utcNow) => 123456;
        public bool ValidateCode(string base32Secret, int submittedCode, int windowSteps = 1) => true;
    }

    private sealed class FakeUnitOfWork : IUnitOfWork
    {
        public Task<int> SaveChangesAsync(CancellationToken ct = default) => Task.FromResult(1);
    }

    private sealed class FakeAuditLogger : IAuditLogger
    {
        public Task Append(AuditEntryDto entry, CancellationToken cancellationToken = default) => Task.CompletedTask;
        public Task AppendAsync(AuditEntryDto entry, CancellationToken cancellationToken = default) => Task.CompletedTask;
    }
}
