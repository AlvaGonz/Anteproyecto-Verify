namespace Application.DTOs.ExternalValidation;

using System;
using System.Collections.Generic;

public record ExternalValidationRequest(
    Guid ProjectId,
    Guid? DocumentId,
    string ReferenceNumber,
    ExternalProviderType TargetProvider,
    Dictionary<string, string>? AdditionalParameters = null
);
