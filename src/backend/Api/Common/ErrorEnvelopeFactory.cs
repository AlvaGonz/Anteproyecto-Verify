namespace Api.Common;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

public static class ErrorEnvelopeFactory
{
    public static ObjectResult BadRequest(
        HttpContext context,
        string code,
        string message,
        bool lockedOut = false)
    {
        var envelope = Build(context, code, message, lockedOut);
        return new BadRequestObjectResult(envelope) { StatusCode = StatusCodes.Status400BadRequest };
    }

    public static ObjectResult Locked(
        HttpContext context,
        string code,
        string message)
    {
        var envelope = Build(context, code, message, true);
        return new ObjectResult(envelope) { StatusCode = StatusCodes.Status423Locked };
    }

    private static ErrorEnvelope Build(HttpContext context, string code, string message, bool lockedOut)
    {
        return new ErrorEnvelope
        {
            Succeeded = false,
            Code = code,
            Message = message,
            CorrelationId = context.GetCorrelationId(),
            LockedOut = lockedOut,
        };
    }
}
