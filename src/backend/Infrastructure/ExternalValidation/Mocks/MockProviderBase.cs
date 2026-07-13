namespace Infrastructure.ExternalValidation.Mocks;

using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.ExternalValidation;
using Application.DTOs.ExternalValidation;
using ExternalValidation.Configuration;
using Microsoft.Extensions.Options;

public abstract class MockProviderBase : IExternalValidationProvider
{
    protected readonly ExternalValidationOptions _options;
    public abstract ExternalProviderType ProviderType { get; }

    protected MockProviderBase(IOptions<ExternalValidationOptions> options)
    {
        _options = options.Value;
    }

    public async Task<ExternalValidationResult> ValidateAsync(ExternalValidationRequest request, CancellationToken cancellationToken = default)
    {
        var providerOptions = _options.Providers.GetValueOrDefault(ProviderType) ?? new ExternalProviderOptions();

        if (!providerOptions.Enabled)
        {
            return new ExternalValidationResult(
                ProviderType,
                ExternalValidationStatus.ProviderUnavailable,
                false,
                "Proveedor deshabilitado por configuración.",
                new List<string>(),
                DateTime.UtcNow,
                null
            );
        }

        if (providerOptions.SimulatedLatencyMs > 0)
        {
            await Task.Delay(providerOptions.SimulatedLatencyMs, cancellationToken);
        }

        // Deterministic simulation based on ReferenceNumber prefix
        var refNum = request.ReferenceNumber?.ToUpperInvariant() ?? string.Empty;

        if (refNum.StartsWith("ERR-"))
        {
            return SimulateError(request);
        }
        if (refNum.StartsWith("NOTFOUND-"))
        {
            return SimulateNotFound(request);
        }
        if (refNum.StartsWith("INCONSISTENT-"))
        {
            return SimulateInconsistent(request);
        }

        // Default to success or configured default scenario
        return SimulateSuccess(request);
    }

    protected abstract ExternalValidationResult SimulateSuccess(ExternalValidationRequest request);
    protected abstract ExternalValidationResult SimulateInconsistent(ExternalValidationRequest request);
    
    protected virtual ExternalValidationResult SimulateNotFound(ExternalValidationRequest request)
    {
        return new ExternalValidationResult(
            ProviderType,
            ExternalValidationStatus.NotFound,
            false,
            $"No se encontró registro para la referencia {request.ReferenceNumber}.",
            new List<string> { "Registro inexistente en la base de datos de la institución." },
            DateTime.UtcNow,
            null
        );
    }

    protected virtual ExternalValidationResult SimulateError(ExternalValidationRequest request)
    {
        return new ExternalValidationResult(
            ProviderType,
            ExternalValidationStatus.Error,
            false,
            "Error interno simulado del proveedor.",
            new List<string> { "El servicio externo respondió con un error 500." },
            DateTime.UtcNow,
            null
        );
    }
}
