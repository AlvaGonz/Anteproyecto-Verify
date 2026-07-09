namespace Application.Abstractions.Security;

using System.Text.Json.Serialization;
using System.Threading;
using System.Threading.Tasks;

public class GoogleUserProfile
{
    [JsonPropertyName("sub")]
    public string Sub { get; set; } = null!;
    
    [JsonPropertyName("email")]
    public string Email { get; set; } = null!;
    
    [JsonPropertyName("name")]
    public string Name { get; set; } = null!;
    
    [JsonPropertyName("given_name")]
    public string? GivenName { get; set; }
    
    [JsonPropertyName("family_name")]
    public string? FamilyName { get; set; }
    
    [JsonPropertyName("picture")]
    public string? Picture { get; set; }
    
    [JsonPropertyName("email_verified")]
    public bool EmailVerified { get; set; }
}

public interface IGoogleAuthService
{
    Task<GoogleUserProfile?> VerifyTokenAsync(string credential, CancellationToken cancellationToken = default);
}
