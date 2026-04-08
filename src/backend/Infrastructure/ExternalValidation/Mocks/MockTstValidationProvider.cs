namespace Infrastructure.ExternalValidation.Mocks;

using System;
using System.Collections.Generic;
using Application.DTOs.ExternalValidation;
using Infrastructure.ExternalValidation.Configuration;
using Microsoft.Extensions.Options;

public class MockTstValidationProvider : MockProviderBase
{
    public override ExternalProviderType ProviderType => ExternalProviderType.TST;

    public MockTstValidationProvider(IOptions<ExternalValidationOptions> options) : base(options) { }

    protected override ExternalValidationResult SimulateSuccess(ExternalValidationRequest request)
    {
        return new ExternalValidationResult(
            ProviderType,
            ExternalValidationStatus.Success,
            true,
            "Estado jurídico validado en Tribunal Superior de Tierras.",
            new List<string>(),
            DateTime.UtcNow,
            $"TST-MOCK-{Guid.NewGuid().ToString().Substring(0, 8)}",
            new { Referencia = request.ReferenceNumber, LitisPendiente = false, Oposiciones = 0 }
        );
    }

    protected override ExternalValidationResult SimulateInconsistent(ExternalValidationRequest request)
    {
        return new ExternalValidationResult(
            ProviderType,
            ExternalValidationStatus.Inconsistent,
            false,
            "Inconsistencia en estado jurídico.",
            new List<string> { "El inmueble presenta una litis sobre derechos registrados pendiente.", "Existe una oposición de venta." },
            DateTime.UtcNow,
            $"TST-MOCK-{Guid.NewGuid().ToString().Substring(0, 8)}",
            new { Referencia = request.ReferenceNumber, LitisPendiente = true, Oposiciones = 1 }
        );
    }
}
