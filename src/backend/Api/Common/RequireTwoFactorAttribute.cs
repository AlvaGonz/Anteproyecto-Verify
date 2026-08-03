namespace Api.Common;

using System;
using System.Linq;
using System.Threading.Tasks;
using Application.Abstractions.Persistence;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

/// <summary>
/// Gate sensitive actions so that users with 2FA enabled must have completed
/// the second factor in the current session (JWT <c>amr=2fa</c>).
/// Users without 2FA enabled pass through.
///</summary>
public sealed class RequireTwoFactorAttribute : Attribute, IAsyncAuthorizationFilter
{
    // ASP.NET Core's JWT middleware maps the standard "amr" claim to its
    // namespaced URI, so check both keys for portability.
    private const string AmrClaimOriginal = "amr";
    private const string AmrClaimMapped = "http://schemas.microsoft.com/claims/authnmethodsreferences";

    public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
    {
        var http = context.HttpContext;
        var user = http.User;
        if (user?.Identity?.IsAuthenticated != true)
        {
            context.Result = new ChallengeResult();
            return;
        }

        var id = user.FindFirst("sub")?.Value ?? user.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(id) || !Guid.TryParse(id, out var userId))
        {
            context.Result = new ChallengeResult();
            return;
        }

        var repo = http.RequestServices.GetService<IUsuarioRepository>();
        var dbUser = repo is null ? null : await repo.GetByIdAsync(userId, http.RequestAborted);

        if (dbUser?.TwoFactorEnabled != true)
        {
            return;
        }

        var amr = user.FindFirst(AmrClaimOriginal)?.Value
                  ?? user.FindFirst(AmrClaimMapped)?.Value;
        if (amr == "2fa")
        {
            return;
        }

        context.Result = new ObjectResult(new
        {
            succeeded = false,
            requiresStepUp = true,
            message = "Se requiere verificación de segundo factor para realizar esta acción."
        })
        {
            StatusCode = StatusCodes.Status403Forbidden
        };
    }
}
