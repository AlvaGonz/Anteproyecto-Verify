using Infrastructure.Security;
using Xunit;

namespace UnitTests;

public class TotpServiceTests
{
    private readonly TotpService _sut = new();

    [Fact]
    public void GenerateSecret_ReturnsBase32OfAtLeast26Chars()
    {
        var secret = _sut.GenerateSecret();
        Assert.NotNull(secret);
        Assert.True(secret.Length >= 26, $"expected >=26 chars, got {secret.Length}");
    }

    [Fact]
    public void BuildOtpAuthUri_IncludesLabelIssuerAndSecret()
    {
        const string secret = "JBSWY3DPEHPK3PXP";
        var uri = _sut.BuildOtpAuthUri("alice@example.com", secret, "VeriFinca");

        Assert.StartsWith("otpauth://totp/", uri);
        Assert.Contains("secret=JBSWY3DPEHPK3PXP", uri);
        Assert.Contains("issuer=VeriFinca", uri);
    }

    [Fact]
    public void ComputeCode_IsDeterministic_ForSameSecretAndUtcNow()
    {
        const string secret = "JBSWY3DPEHPK3PXP";
        var t = new DateTime(2026, 7, 29, 12, 0, 0, DateTimeKind.Utc);

        var a = _sut.ComputeCode(secret, t);
        var b = _sut.ComputeCode(secret, t);

        Assert.Equal(a, b);
        Assert.InRange(a, 0, 999999);
    }

    [Fact]
    public void ComputeCode_DiffersAcrossTimeSteps()
    {
        const string secret = "JBSWY3DPEHPK3PXP";
        var t = new DateTime(2026, 7, 29, 12, 0, 0, DateTimeKind.Utc);
        var tPlus30 = t.AddSeconds(30);

        var a = _sut.ComputeCode(secret, t);
        var b = _sut.ComputeCode(secret, tPlus30);

        Assert.NotEqual(a, b);
    }

    [Fact]
    public void ValidateCode_AcceptsCodeFromCurrentStep()
    {
        const string secret = "JBSWY3DPEHPK3PXP";
        var now = DateTime.UtcNow;
        var code = _sut.ComputeCode(secret, now);

        Assert.True(_sut.ValidateCode(secret, code, windowSteps: 0));
    }

    [Fact]
    public void ValidateCode_AcceptsCodeFromPreviousStep_WithinWindow()
    {
        const string secret = "JBSWY3DPEHPK3PXP";
        var now = DateTime.UtcNow;
        var previousCode = _sut.ComputeCode(secret, now.AddSeconds(-30));

        Assert.True(_sut.ValidateCode(secret, previousCode, windowSteps: 1));
    }

    [Fact]
    public void ValidateCode_RejectsCodeOutsideWindow()
    {
        const string secret = "JBSWY3DPEHPK3PXP";
        var now = DateTime.UtcNow;
        var ancientCode = _sut.ComputeCode(secret, now.AddSeconds(-120));

        Assert.False(_sut.ValidateCode(secret, ancientCode, windowSteps: 1));
    }
}
