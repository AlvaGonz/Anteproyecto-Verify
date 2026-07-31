using Application.Abstractions.Security;
using Infrastructure.Security;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace UnitTests;

public class TwoFactorSecretProtectorTests
{
    private static ITwoFactorSecretProtector CreateSut()
    {
        var services = new ServiceCollection();
        services.AddDataProtection()
            .SetApplicationName("VeriFinca.Tests")
            .PersistKeysToFileSystem(new DirectoryInfo(Path.Combine(Path.GetTempPath(), "dpkeys-" + Guid.NewGuid().ToString("N"))));
        var sp = services.BuildServiceProvider();
        var provider = sp.GetRequiredService<Microsoft.AspNetCore.DataProtection.IDataProtectionProvider>();
        var protector = provider.CreateProtector("TwoFactorSecret");
        return new TwoFactorSecretProtector(protector);
    }

    [Fact]
    public void Protect_ThenUnprotect_ReturnsOriginalPlaintext()
    {
        var sut = CreateSut();
        const string secret = "JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP";

        var protected1 = sut.Protect(secret);
        var back = sut.Unprotect(protected1);

        Assert.Equal(secret, back);
    }

    [Fact]
    public void Protect_Differs_ForDifferentInputs()
    {
        var sut = CreateSut();
        Assert.NotEqual(sut.Protect("alpha"), sut.Protect("beta"));
    }

    [Fact]
    public void Protect_ProducesNonEmptyString()
    {
        var sut = CreateSut();
        var protected1 = sut.Protect("any-secret");
        Assert.False(string.IsNullOrEmpty(protected1));
        Assert.NotEqual("any-secret", protected1);
    }

    [Fact]
    public void Unprotect_FailsCleanly_OnTamperedCiphertext()
    {
        var sut = CreateSut();
        var protected1 = sut.Protect("secret");
        var tampered = protected1.Substring(0, protected1.Length - 4) + "AAAA";

        Assert.ThrowsAny<System.Exception>(() => sut.Unprotect(tampered));
    }
}
