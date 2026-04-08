namespace Infrastructure.ExternalValidation.Mocks;

using System;
using System.Collections.Generic;
using Application.DTOs.ExternalValidation;
using Infrastructure.ExternalValidation.Configuration;
using Microsoft.Extensions.Options;

public class MockCatastroValidationProvider : MockProviderBase
{
    public override ExternalProviderType ProviderType => ExternalProviderType.Catastro;

    public MockCatastroValidationProvider(IOptions<ExternalValidationOptions> options) : base(options) { }

    protected override ExternalValidationResult SimulateSuccess(ExternalValidationRequest request)
    {
        return new ExternalValidationResult(
            ProviderType,
            ExternalValidationStatus.Success,
            true,
            "Validación exitosa en Catastro Nacional.",
            new List<string>(),
            DateTime.UtcNow,
            $"CAT-MOCK-{Guid.NewGuid().ToString().Substring(0, 8)}",
            new { DesignacionCatastral = request.ReferenceNumber, Uso = "Residencial", ValorFiscal = 5000000 }
        );
    }

    protected override ExternalValidationResult SimulateInconsistent(ExternalValidationRequest request)
    {
        return new ExternalValidationResult(
            ProviderType,
            ExternalValidationStatus.Inconsistent,
            false,
            "Inconsistencia de datos en Catastro.",
            new List<string> { "La designación catastral no corresponde a la ubicación del proyecto." },
            DateTime.UtcNow,
            $"CAT-MOCK-{Guid.NewGuid().ToString().Substring(0, 8)}",
            new { DesignacionCatastral = request.ReferenceNumber, Uso = "Comercial", ValorFiscal = 1000000 }
        );
    }
}
