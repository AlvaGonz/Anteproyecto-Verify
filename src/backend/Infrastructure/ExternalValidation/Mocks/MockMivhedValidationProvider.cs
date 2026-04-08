namespace Infrastructure.ExternalValidation.Mocks;

using System;
using System.Collections.Generic;
using Application.DTOs.ExternalValidation;
using Infrastructure.ExternalValidation.Configuration;
using Microsoft.Extensions.Options;

public class MockMivhedValidationProvider : MockProviderBase
{
    public override ExternalProviderType ProviderType => ExternalProviderType.MIVHED;

    public MockMivhedValidationProvider(IOptions<ExternalValidationOptions> options) : base(options) { }

    protected override ExternalValidationResult SimulateSuccess(ExternalValidationRequest request)
    {
        return new ExternalValidationResult(
            ProviderType,
            ExternalValidationStatus.Success,
            true,
            "Licencia de construcción validada en MIVHED.",
            new List<string>(),
            DateTime.UtcNow,
            $"MIV-MOCK-{Guid.NewGuid().ToString().Substring(0, 8)}",
            new { Licencia = request.ReferenceNumber, Estado = "Aprobada", FechaVencimiento = DateTime.UtcNow.AddYears(1) }
        );
    }

    protected override ExternalValidationResult SimulateInconsistent(ExternalValidationRequest request)
    {
        return new ExternalValidationResult(
            ProviderType,
            ExternalValidationStatus.Inconsistent,
            false,
            "Inconsistencia en licencia MIVHED.",
            new List<string> { "La licencia de construcción se encuentra vencida." },
            DateTime.UtcNow,
            $"MIV-MOCK-{Guid.NewGuid().ToString().Substring(0, 8)}",
            new { Licencia = request.ReferenceNumber, Estado = "Vencida", FechaVencimiento = DateTime.UtcNow.AddMonths(-1) }
        );
    }
}
