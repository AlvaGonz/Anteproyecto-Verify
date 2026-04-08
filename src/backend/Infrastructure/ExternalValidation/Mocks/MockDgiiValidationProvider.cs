namespace Infrastructure.ExternalValidation.Mocks;

using System;
using System.Collections.Generic;
using Application.DTOs.ExternalValidation;
using Infrastructure.ExternalValidation.Configuration;
using Microsoft.Extensions.Options;

public class MockDgiiValidationProvider : MockProviderBase
{
    public override ExternalProviderType ProviderType => ExternalProviderType.DGII;

    public MockDgiiValidationProvider(IOptions<ExternalValidationOptions> options) : base(options) { }

    protected override ExternalValidationResult SimulateSuccess(ExternalValidationRequest request)
    {
        return new ExternalValidationResult(
            ProviderType,
            ExternalValidationStatus.Success,
            true,
            "Validación exitosa en DGII.",
            new List<string>(),
            DateTime.UtcNow,
            $"DGII-MOCK-{Guid.NewGuid().ToString().Substring(0, 8)}",
            new { RNC = request.ReferenceNumber, Estado = "Al día" }
        );
    }

    protected override ExternalValidationResult SimulateInconsistent(ExternalValidationRequest request)
    {
        return new ExternalValidationResult(
            ProviderType,
            ExternalValidationStatus.Inconsistent,
            false,
            "Inconsistencia de datos en DGII.",
            new List<string> { "El promotor tiene deudas pendientes con la DGII." },
            DateTime.UtcNow,
            $"DGII-MOCK-{Guid.NewGuid().ToString().Substring(0, 8)}",
            new { RNC = request.ReferenceNumber, Estado = "Con deudas" }
        );
    }
}
