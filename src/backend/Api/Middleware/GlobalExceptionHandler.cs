namespace Api.Middleware;

using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

public class GlobalExceptionHandler : IExceptionHandler
{
    private readonly ILogger<GlobalExceptionHandler> _logger;

    public GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger)
    {
        _logger = logger;
    }

    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        _logger.LogError(
            exception, "Exception occurred: {Message}", exception.Message);

        var problemDetails = new ProblemDetails
        {
            Status = StatusCodes.Status500InternalServerError,
            Title = "Server Error",
            Detail = "An unexpected error occurred. Please try again later."
        };

        if (exception is ArgumentException || exception is InvalidOperationException)
        {
            problemDetails.Status = StatusCodes.Status400BadRequest;
            problemDetails.Title = "Bad Request";
            problemDetails.Detail = exception.Message;
            problemDetails.Type = "https://verifinca.do/errors/bad-request";
        }
        else if (exception is Application.Common.Exceptions.BadRequestException)
        {
            problemDetails.Status = StatusCodes.Status400BadRequest;
            problemDetails.Title = "Bad Request";
            problemDetails.Detail = exception.Message;
            problemDetails.Type = "https://verifinca.do/errors/bad-request";
        }
        else if (exception is Application.Common.Exceptions.NotFoundException)
        {
            problemDetails.Status = StatusCodes.Status404NotFound;
            problemDetails.Title = "Not Found";
            problemDetails.Detail = exception.Message;
            problemDetails.Type = "https://verifinca.do/errors/not-found";
        }
        else if (exception is Application.Common.Exceptions.QuotaExceededException)
        {
            problemDetails.Status = StatusCodes.Status402PaymentRequired;
            problemDetails.Title = "Quota Exceeded";
            problemDetails.Detail = exception.Message;
            problemDetails.Type = "https://verifinca.do/errors/quota-exceeded";
        }
        else
        {
            problemDetails.Type = "https://verifinca.do/errors/internal-server-error";
        }

        httpContext.Response.StatusCode = problemDetails.Status.Value;

        await httpContext.Response
            .WriteAsJsonAsync(problemDetails, cancellationToken);

        return true;
    }
}
