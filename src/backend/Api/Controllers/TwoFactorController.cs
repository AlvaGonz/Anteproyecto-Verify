namespace Api.Controllers;

using System;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Application.Features.TwoFactor;
using Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/auth/2fa")]
[Authorize]
public class TwoFactorController : ControllerBase
{
    private readonly BeginEnrollmentCommandHandler _beginEnrollment;
    private readonly ConfirmEnrollmentCommandHandler _confirmEnrollment;
    private readonly VerifyTwoFactorCodeCommandHandler _verifyCode;
    private readonly ConsumeRecoveryCodeCommandHandler _consumeRecoveryCode;
    private readonly Disable2FACommandHandler _disable2FA;
    private readonly EmailOtpService _emailOtp;
    private readonly GetTwoFactorStatusQueryHandler _status;

    public TwoFactorController(
        BeginEnrollmentCommandHandler beginEnrollment,
        ConfirmEnrollmentCommandHandler confirmEnrollment,
        VerifyTwoFactorCodeCommandHandler verifyCode,
        ConsumeRecoveryCodeCommandHandler consumeRecoveryCode,
        Disable2FACommandHandler disable2FA,
        EmailOtpService emailOtp,
        GetTwoFactorStatusQueryHandler status)
    {
        _beginEnrollment = beginEnrollment;
        _confirmEnrollment = confirmEnrollment;
        _verifyCode = verifyCode;
        _consumeRecoveryCode = consumeRecoveryCode;
        _disable2FA = disable2FA;
        _emailOtp = emailOtp;
        _status = status;
    }

    private Guid GetUserId()
    {
        var id = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        return Guid.TryParse(id, out var g) ? g : Guid.Empty;
    }

    private IActionResult WriteSessionCookies(string token)
    {
        Response.Cookies.Append("jwt", token, new CookieOptions
        {
            HttpOnly = true,
            Secure = Request.IsHttps,
            SameSite = SameSiteMode.Lax,
            Path = "/",
            MaxAge = TimeSpan.FromDays(1)
        });
        return Ok(new { succeeded = true });
    }

    [HttpPost("enrollment/begin")]
    public async Task<IActionResult> BeginEnrollment(CancellationToken ct)
    {
        var result = await _beginEnrollment.Handle(new BeginEnrollmentCommand(GetUserId()), ct);
        if (!result.IsSuccess) return BadRequest(new { succeeded = false, message = result.ErrorMessage });
        return Ok(new { succeeded = true, secret = result.Secret, otpAuthUri = result.OtpAuthUri });
    }

    [HttpPost("enrollment/confirm")]
    public async Task<IActionResult> ConfirmEnrollment([FromBody] ConfirmEnrollmentRequest req, CancellationToken ct)
    {
        var result = await _confirmEnrollment.Handle(new ConfirmEnrollmentCommand(GetUserId(), req.Code), ct);
        if (!result.IsSuccess) return BadRequest(new { succeeded = false, message = result.ErrorMessage });
        return Ok(new { succeeded = true, recoveryCodes = result.RecoveryCodes });
    }

    [HttpPost("verify")]
    public async Task<IActionResult> Verify([FromBody] VerifyRequest req, CancellationToken ct)
    {
        var result = await _verifyCode.Handle(new VerifyTwoFactorCodeCommand(req.ChallengeToken, req.Code), ct);
        if (!result.IsSuccess) return BadRequest(new { succeeded = false, message = result.ErrorMessage });
        return WriteSessionCookies(result.Token!);
    }

    [HttpPost("recovery-code")]
    public async Task<IActionResult> RecoveryCode([FromBody] RecoveryRequest req, CancellationToken ct)
    {
        var result = await _consumeRecoveryCode.Handle(new ConsumeRecoveryCodeCommand(req.ChallengeToken, req.RecoveryCode), ct);
        if (!result.IsSuccess) return BadRequest(new { succeeded = false, message = result.ErrorMessage });
        return WriteSessionCookies(result.Token!);
    }

    [HttpPost("disable")]
    public async Task<IActionResult> Disable([FromBody] DisableRequest req, CancellationToken ct)
    {
        var result = await _disable2FA.Handle(new Disable2FACommand(GetUserId(), req.Password, req.Code), ct);
        if (!result.IsSuccess) return BadRequest(new { succeeded = false, message = result.ErrorMessage });
        return Ok(new { succeeded = true });
    }

    [HttpPost("email-otp/request")]
    public async Task<IActionResult> RequestEmailOtp([FromBody] EmailOtpRequest req, CancellationToken ct)
    {
        var result = await _emailOtp.Handle(new RequestEmailOtpCommand(req.ChallengeToken), ct);
        if (!result.IsSuccess) return BadRequest(new { succeeded = false, message = result.ErrorMessage });
        return Ok(new { succeeded = true });
    }

    [HttpPost("email-otp/verify")]
    public async Task<IActionResult> VerifyEmailOtp([FromBody] VerifyEmailOtpRequest req, CancellationToken ct)
    {
        var result = await _emailOtp.HandleVerify(new VerifyEmailOtpCommand(req.ChallengeToken, req.Code), ct);
        if (!result.IsSuccess) return BadRequest(new { succeeded = false, message = result.ErrorMessage });
        return WriteSessionCookies(result.Token!);
    }

    [HttpGet("status")]
    public async Task<IActionResult> Status(CancellationToken ct)
    {
        var result = await _status.Handle(new GetTwoFactorStatusQuery(GetUserId()), ct);
        return Ok(result);
    }

    public sealed record ConfirmEnrollmentRequest(int Code);
    public sealed record VerifyRequest(string ChallengeToken, int Code);
    public sealed record RecoveryRequest(string ChallengeToken, string RecoveryCode);
    public sealed record DisableRequest(string Password, int Code);
    public sealed record EmailOtpRequest(string ChallengeToken);
    public sealed record VerifyEmailOtpRequest(string ChallengeToken, string? Code, string? Otp)
    {
        public string EffectiveCode => Code ?? Otp ?? string.Empty;
    }
}
