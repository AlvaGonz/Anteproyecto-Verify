namespace Infrastructure.ExternalValidation.Mocks;

using System;
using System.Collections.Generic;
using Application.DTOs.ExternalValidation;
using ExternalValidation.Configuration;
using Microsoft.Extensions.Options;

public class MockAyuntamientoValidationProvider : MockProviderBase
{
    public override ExternalProviderType ProviderType => ExternalProviderType.Ayuntamiento;

    public MockAyuntamientoValidationProvider(IOptions<ExternalValidationOptions> options) : base(options) { }

    protected override ExternalValidationResult SimulateSuccess(ExternalValidationRequest request)
    {
        return new ExternalValidationResult(
            ProviderType,
            ExternalValidationStatus.Success,
            true,
            "Uso de suelo validado en Ayuntamiento.",
            new List<string>(),
            DateTime.UtcNow,
            $"AYU-MOCK-{Guid.NewGuid().ToString().Substring(0, 8)}",
            new { Permiso = request.ReferenceNumber, Estado = "Aprobado", UsoPermitido = "Residencial Alta Densidad" }
        );
    }

    protected override ExternalValidationResult SimulateInconsistent(ExternalValidationRequest request)
    {
        return new ExternalValidationResult(
            ProviderType,
            ExternalValidationStatus.Inconsistent,
            false,
            "Inconsistencia en uso de suelo.",
            new List<string> { "El uso de suelo aprobado no coincide con la densidad del proyecto." },
            DateTime.UtcNow,
            $"AYU-MOCK-{Guid.NewGuid().ToString().Substring(0, 8)}",
            new { Permiso = request.ReferenceNumber, Estado = "Aprobado", UsoPermitido = "Comercial" }
        );
    }
}
