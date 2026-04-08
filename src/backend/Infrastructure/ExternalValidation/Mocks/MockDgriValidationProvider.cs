namespace Infrastructure.ExternalValidation.Mocks;

using System;
using System.Collections.Generic;
using Application.DTOs.ExternalValidation;
using Infrastructure.ExternalValidation.Configuration;
using Microsoft.Extensions.Options;

public class MockDgriValidationProvider : MockProviderBase
{
    public override ExternalProviderType ProviderType => ExternalProviderType.DGRI;

    public MockDgriValidationProvider(IOptions<ExternalValidationOptions> options) : base(options) { }

    protected override ExternalValidationResult SimulateSuccess(ExternalValidationRequest request)
    {
        return new ExternalValidationResult(
            ProviderType,
            ExternalValidationStatus.Success,
            true,
            "Validación exitosa en DGRI.",
            new List<string>(),
            DateTime.UtcNow,
            $"DGRI-MOCK-{Guid.NewGuid().ToString().Substring(0, 8)}",
            new { Matricula = request.ReferenceNumber, Estado = "Activo", Propietario = "Juan Perez" }
        );
    }

    protected override ExternalValidationResult SimulateInconsistent(ExternalValidationRequest request)
    {
        return new ExternalValidationResult(
            ProviderType,
            ExternalValidationStatus.Inconsistent,
            false,
            "Inconsistencia de datos en DGRI.",
            new List<string> { "El propietario registrado no coincide con el solicitante.", "El área del terreno difiere." },
            DateTime.UtcNow,
            $"DGRI-MOCK-{Guid.NewGuid().ToString().Substring(0, 8)}",
            new { Matricula = request.ReferenceNumber, Estado = "Activo", Propietario = "Pedro Gomez" }
        );
    }
}
