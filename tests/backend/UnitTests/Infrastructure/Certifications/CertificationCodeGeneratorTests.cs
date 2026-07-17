namespace UnitTests.Infrastructure.Certifications;

using global::Infrastructure.Certifications;
using Xunit;

public class CertificationCodeGeneratorTests
{
    [Fact]
    public void GenerateCode_ShouldReturnFormattedCode()
    {
        // Arrange
        var generator = new CertificationCodeGenerator();

        // Act
        var code = generator.GenerateCode();

        // Assert
        Assert.NotNull(code);
        Assert.StartsWith($"VF-{System.DateTime.UtcNow.Year}-", code);
        Assert.Equal(16, code.Length); // VF-YYYY-XXXXXXXX (3 + 4 + 1 + 8)
    }

    [Fact]
    public void GenerateCode_ShouldGenerateUniqueCodes()
    {
        // Arrange
        var generator = new CertificationCodeGenerator();

        // Act
        var code1 = generator.GenerateCode();
        var code2 = generator.GenerateCode();

        // Assert
        Assert.NotEqual(code1, code2);
    }
}

