namespace Infrastructure.ExternalValidation;

using System;
using System.Collections.Generic;
using System.Linq;
using Application.Abstractions.ExternalValidation;
using Application.DTOs.ExternalValidation;

public class ExternalProviderResolver : IExternalProviderResolver
{
    private readonly IEnumerable<IExternalValidationProvider> _providers;

    public ExternalProviderResolver(IEnumerable<IExternalValidationProvider> providers)
    {
        _providers = providers;
    }

    public IExternalValidationProvider Resolve(ExternalProviderType providerType)
    {
        var provider = _providers.FirstOrDefault(p => p.ProviderType == providerType);
        if (provider == null)
        {
            throw new KeyNotFoundException($"No provider registered for {providerType}");
        }
        return provider;
    }
}
