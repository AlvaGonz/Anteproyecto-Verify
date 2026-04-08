namespace Infrastructure.ExternalValidation.Configuration;

using Application.DTOs.ExternalValidation;
using System.Collections.Generic;

public class ExternalProviderOptions
{
    public bool Enabled { get; set; } = true;
    public bool MockMode { get; set; } = true;
    public int SimulatedLatencyMs { get; set; } = 500;
    public string DefaultScenario { get; set; } = "Success";
    public string TechnicalName { get; set; } = string.Empty;
}

public class ExternalValidationOptions
{
    public Dictionary<ExternalProviderType, ExternalProviderOptions> Providers { get; set; } = new();
}
