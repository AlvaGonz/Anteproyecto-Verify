namespace UnitTests.Infrastructure.ExternalValidation;

using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using global::Application.DTOs.ExternalValidation;
using global::Infrastructure.ExternalValidation;
using global::Infrastructure.ExternalValidation.Configuration;
using global::Infrastructure.ExternalValidation.Mocks;
using Microsoft.Extensions.Options;
using Xunit;

public class MockProvidersTests
{
    private readonly IOptions<ExternalValidationOptions> _options;

    public MockProvidersTests()
    {
        _options = Options.Create(new ExternalValidationOptions
        {
            Providers = new Dictionary<ExternalProviderType, ExternalProviderOptions>
            {
                { ExternalProviderType.DGRI, new ExternalProviderOptions { Enabled = true, SimulatedLatencyMs = 0 } },
                { ExternalProviderType.Catastro, new ExternalProviderOptions { Enabled = false } }
            }
        });
    }

    [Fact]
    public async Task MockDgriProvider_ShouldReturnSuccess_WhenReferenceIsNormal()
    {
        // Arrange
        var provider = new MockDgriValidationProvider(_options);
        var request = new ExternalValidationRequest(Guid.NewGuid(), Guid.NewGuid(), "123456", ExternalProviderType.DGRI);

        // Act
        var result = await provider.ValidateAsync(request);

        // Assert
        Assert.Equal(ExternalValidationStatus.Success, result.Status);
        Assert.True(result.IsMatch);
        Assert.Empty(result.Findings);
    }

    [Fact]
    public async Task MockDgriProvider_ShouldReturnInconsistent_WhenReferenceStartsWithINCONSISTENT()
    {
        // Arrange
        var provider = new MockDgriValidationProvider(_options);
        var request = new ExternalValidationRequest(Guid.NewGuid(), Guid.NewGuid(), "INCONSISTENT-123", ExternalProviderType.DGRI);

        // Act
        var result = await provider.ValidateAsync(request);

        // Assert
        Assert.Equal(ExternalValidationStatus.Inconsistent, result.Status);
        Assert.False(result.IsMatch);
        Assert.NotEmpty(result.Findings);
    }

    [Fact]
    public async Task MockDgriProvider_ShouldReturnNotFound_WhenReferenceStartsWithNOTFOUND()
    {
        // Arrange
        var provider = new MockDgriValidationProvider(_options);
        var request = new ExternalValidationRequest(Guid.NewGuid(), Guid.NewGuid(), "NOTFOUND-123", ExternalProviderType.DGRI);

        // Act
        var result = await provider.ValidateAsync(request);

        // Assert
        Assert.Equal(ExternalValidationStatus.NotFound, result.Status);
        Assert.False(result.IsMatch);
    }

    [Fact]
    public async Task MockCatastroProvider_ShouldReturnUnavailable_WhenDisabledInOptions()
    {
        // Arrange
        var provider = new MockCatastroValidationProvider(_options);
        var request = new ExternalValidationRequest(Guid.NewGuid(), Guid.NewGuid(), "123456", ExternalProviderType.Catastro);

        // Act
        var result = await provider.ValidateAsync(request);

        // Assert
        Assert.Equal(ExternalValidationStatus.ProviderUnavailable, result.Status);
        Assert.False(result.IsMatch);
    }

    [Fact]
    public void ExternalProviderResolver_ShouldResolveCorrectProvider()
    {
        // Arrange
        var providers = new List<global::Application.Abstractions.ExternalValidation.IExternalValidationProvider>
        {
            new MockDgriValidationProvider(_options),
            new MockCatastroValidationProvider(_options)
        };
        var resolver = new ExternalProviderResolver(providers);

        // Act
        var dgriProvider = resolver.Resolve(ExternalProviderType.DGRI);
        var catastroProvider = resolver.Resolve(ExternalProviderType.Catastro);

        // Assert
        Assert.IsType<MockDgriValidationProvider>(dgriProvider);
        Assert.IsType<MockCatastroValidationProvider>(catastroProvider);
    }

    [Fact]
    public void ExternalProviderResolver_ShouldThrowKeyNotFound_WhenProviderNotRegistered()
    {
        // Arrange
        var providers = new List<global::Application.Abstractions.ExternalValidation.IExternalValidationProvider>
        {
            new MockDgriValidationProvider(_options)
        };
        var resolver = new ExternalProviderResolver(providers);

        // Act & Assert
        Assert.Throws<KeyNotFoundException>(() => resolver.Resolve(ExternalProviderType.DGII));
    }
}

