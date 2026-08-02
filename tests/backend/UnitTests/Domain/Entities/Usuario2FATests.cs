using Domain.Entities;
using Domain.Enums;
using Xunit;

namespace UnitTests;

public class Usuario2FATests
{
    private static Usuario NewUser() =>
        new("John", "Doe", "john@test.com", "hashed", UserRole.User, "8090000000", "00100000000");

    [Fact]
    public void Begin2FAEnrollment_StoresSecret_AndClearsLockout()
    {
        var u = NewUser();
        u.Register2FAFailure();
        u.Register2FAFailure();
        Assert.Equal(2, u.Failed2FAAttempts);

        u.Begin2FAEnrollment("encrypted-secret");

        Assert.Equal("encrypted-secret", u.TwoFactorSecretEncrypted);
        Assert.False(u.TwoFactorEnabled);
        Assert.Equal(0, u.Failed2FAAttempts);
        Assert.Null(u.Lockout2FAUntilUtc);
    }

    [Fact]
    public void Begin2FAEnrollment_Throws_WhenAlreadyEnabled()
    {
        var u = NewUser();
        u.Begin2FAEnrollment("secret");
        u.Confirm2FAEnrollment("[]");

        Assert.Throws<InvalidOperationException>(() => u.Begin2FAEnrollment("again"));
    }

    [Fact]
    public void Confirm2FAEnrollment_SetsEnabledTrue_AndStoresRecoveryCodes()
    {
        var u = NewUser();
        u.Begin2FAEnrollment("secret");

        u.Confirm2FAEnrollment("[]hashjson");

        Assert.True(u.TwoFactorEnabled);
        Assert.Equal("[]hashjson", u.RecoveryCodesHashJson);
        Assert.NotNull(u.Last2FAVerifiedUtc);
    }

    [Fact]
    public void Confirm2FAEnrollment_Throws_WhenNoPendingEnrollment()
    {
        var u = NewUser();
        Assert.Throws<InvalidOperationException>(() => u.Confirm2FAEnrollment("[]"));
    }

    [Fact]
    public void Register2FAFailure_LocksAtMaxAttempts()
    {
        var u = NewUser();
        for (int i = 0; i < Usuario.TwoFactorMaxFailedAttempts - 1; i++)
        {
            u.Register2FAFailure();
            Assert.False(u.Is2FALockedOut);
        }
        u.Register2FAFailure();
        Assert.True(u.Is2FALockedOut);
        Assert.NotNull(u.Lockout2FAUntilUtc);
    }

    [Fact]
    public void Is2FALockedOut_ResetsAfterLockoutWindow_AndZeroesAttempts()
    {
        var u = NewUser();
        for (int i = 0; i < Usuario.TwoFactorMaxFailedAttempts; i++)
            u.Register2FAFailure();
        Assert.True(u.Is2FALockedOut);

        // Force expiry
        typeof(Usuario).GetProperty("Lockout2FAUntilUtc")!
            .SetValue(u, DateTime.UtcNow.AddMinutes(-1));
        Assert.False(u.Is2FALockedOut);
        Assert.Equal(0, u.Failed2FAAttempts);
    }

    [Fact]
    public void Register2FASuccess_ResetsCounters_AndStampsVerifiedUtc()
    {
        var u = NewUser();
        u.Register2FAFailure();
        u.Register2FAFailure();

        var before = DateTime.UtcNow.AddSeconds(-1);
        u.Register2FASuccess();

        Assert.Equal(0, u.Failed2FAAttempts);
        Assert.Null(u.Lockout2FAUntilUtc);
        Assert.NotNull(u.Last2FAVerifiedUtc);
        Assert.True(u.Last2FAVerifiedUtc >= before);
    }

    [Fact]
    public void Disable2FA_ClearsAllState()
    {
        var u = NewUser();
        u.Begin2FAEnrollment("secret");
        u.Confirm2FAEnrollment("[]");
        u.Register2FAFailure();
        u.MarkEmailOtpSent();

        u.Disable2FA();

        Assert.False(u.TwoFactorEnabled);
        Assert.Null(u.TwoFactorSecretEncrypted);
        Assert.Null(u.RecoveryCodesHashJson);
        Assert.Null(u.Last2FAVerifiedUtc);
        Assert.Null(u.EmailOtpLastSentUtc);
    }

    [Fact]
    public void Disable2FA_Throws_WhenNotEnabled()
    {
        var u = NewUser();
        Assert.Throws<InvalidOperationException>(() => u.Disable2FA());
    }

    [Fact]
    public void ReplaceRecoveryCodes_RotatesHashJson()
    {
        var u = NewUser();
        u.Begin2FAEnrollment("secret");
        u.Confirm2FAEnrollment("old");

        u.ReplaceRecoveryCodes("new");

        Assert.Equal("new", u.RecoveryCodesHashJson);
        Assert.Equal(0, u.Failed2FAAttempts);
    }

    [Fact]
    public void ReplaceRecoveryCodes_Throws_When2FANotEnabled()
    {
        var u = NewUser();
        Assert.Throws<InvalidOperationException>(() => u.ReplaceRecoveryCodes("x"));
    }

    [Fact]
    public void MarkEmailOtpSent_StampsTimestamp()
    {
        var u = NewUser();
        var before = DateTime.UtcNow.AddSeconds(-1);
        u.MarkEmailOtpSent();
        Assert.NotNull(u.EmailOtpLastSentUtc);
        Assert.True(u.EmailOtpLastSentUtc >= before);
    }
}
