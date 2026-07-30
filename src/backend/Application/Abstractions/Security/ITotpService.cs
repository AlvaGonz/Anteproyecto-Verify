namespace Application.Abstractions.Security;

public interface ITotpService
{
    string GenerateSecret();
    string BuildOtpAuthUri(string email, string secret, string issuer);
    int ComputeCode(string base32Secret, DateTime utcNow);
    bool ValidateCode(string base32Secret, int submittedCode, int windowSteps = 1);
}
