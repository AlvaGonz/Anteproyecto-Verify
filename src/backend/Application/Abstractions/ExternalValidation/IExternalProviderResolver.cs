namespace Application.Abstractions.ExternalValidation;

using Application.DTOs.ExternalValidation;

public interface IExternalProviderResolver
{
    IExternalValidationProvider Resolve(ExternalProviderType providerType);
}
