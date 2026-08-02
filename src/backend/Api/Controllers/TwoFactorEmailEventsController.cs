using Application.Common.Errors;
using Infrastructure.Services;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("api/dev/2fa-email-events")]
public class TwoFactorEmailEventsController : ControllerBase
{
    private readonly ITwoFactorEmailEventLogger _logger;
    private readonly IWebHostEnvironment _env;

    public TwoFactorEmailEventsController(
        ITwoFactorEmailEventLogger logger,
        IWebHostEnvironment env)
    {
        _logger = logger;
        _env = env;
    }

    private IActionResult? Guard()
    {
        if (_env.IsDevelopment() || _env.IsEnvironment("Testing")) return null;
        return NotFound();
    }

    [HttpGet]
    public IActionResult GetEvents([FromQuery] string challengeToken)
    {
        var guard = Guard();
        if (guard is not null) return guard;

        if (string.IsNullOrWhiteSpace(challengeToken))
            return BadRequest(new { message = "challengeToken is required." });

        var events = _logger.GetEvents(challengeToken);
        return Ok(events.Select(e => new
        {
            @event = e.Event,
            ts = e.Ts.ToString("O"),
            challengeTokenHash = e.ChallengeTokenHash,
            outcome = e.Outcome,
        }));
    }

    public sealed record ForceFailRequest(bool Enabled);

    [HttpPost("force-fail")]
    public IActionResult ForceFail([FromBody] ForceFailRequest request)
    {
        var guard = Guard();
        if (guard is not null) return guard;

        _logger.ForceFailEnabled = request.Enabled;
        return Ok(new { enabled = _logger.ForceFailEnabled });
    }
}
