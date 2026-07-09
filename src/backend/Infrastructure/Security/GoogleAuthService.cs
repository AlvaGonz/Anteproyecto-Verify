namespace Infrastructure.Security;

using System;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Security;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

public class GoogleAuthService : IGoogleAuthService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<GoogleAuthService> _logger;

    public GoogleAuthService(IConfiguration configuration, ILogger<GoogleAuthService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<GoogleUserProfile?> VerifyTokenAsync(string credential, CancellationToken cancellationToken = default)
    {
        try
        {
            using var httpClient = new HttpClient();
            httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", credential);
            
            var profile = await httpClient.GetFromJsonAsync<GoogleUserProfile>("https://www.googleapis.com/oauth2/v3/userinfo", cancellationToken);
            
            if (profile?.EmailVerified != true)
            {
                _logger.LogWarning("El email no está verificado en Google (AccessToken).");
                return null;
            }

            return profile;
        }
        catch (HttpRequestException ex)
        {
            _logger.LogWarning(ex, "Fallo al obtener userinfo de Google con Access Token.");
            return null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al verificar token de Google.");
            return null;
        }
    }
}
