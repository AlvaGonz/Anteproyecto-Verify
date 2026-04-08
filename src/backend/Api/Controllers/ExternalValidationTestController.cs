namespace Api.Controllers;

using System;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.ExternalValidation;
using Application.DTOs.ExternalValidation;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/external-validation/test")]
public class ExternalValidationTestController : ControllerBase
{
    private readonly IExternalProviderResolver _providerResolver;

    public ExternalValidationTestController(IExternalProviderResolver providerResolver)
    {
        _providerResolver = providerResolver;
    }

    [HttpPost("{provider}")]
    public async Task<IActionResult> TestProvider(ExternalProviderType provider, [FromBody] ExternalValidationRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var validationProvider = _providerResolver.Resolve(provider);
            
            // Ensure the request is targeting the correct provider
            var validatedRequest = request with { TargetProvider = provider };
            
            var result = await validationProvider.ValidateAsync(validatedRequest, cancellationToken);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error interno al probar el proveedor: {ex.Message}");
        }
    }
}
