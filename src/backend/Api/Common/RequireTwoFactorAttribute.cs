namespace Api.Common;

using System;
using System.Linq;
using System.Threading.Tasks;
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
    public Task OnAuthorizationAsync(AuthorizationFilterContext context)
    {
        var user = context.HttpContext.User;
        if (user?.Identity?.IsAuthenticated != true)
        {
            context.Result = new ChallengeResult();
            return Task.CompletedTask;
        }

        var twoFactorEnabled = user.FindFirst("two_factor_enabled")?.Value == "true";
        if (!twoFactorEnabled)
        {
            return Task.CompletedTask;
        }

        var amr = user.FindFirst("amr")?.Value;
        if (amr == "2fa")
        {
            return Task.CompletedTask;
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
        return Task.CompletedTask;
    }
}
