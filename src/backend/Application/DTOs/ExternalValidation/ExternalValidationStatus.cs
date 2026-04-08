namespace Application.DTOs.ExternalValidation;

public enum ExternalValidationStatus
{
    Success = 1,
    Inconsistent = 2,
    NotFound = 3,
    ProviderUnavailable = 4,
    Error = 5
}
