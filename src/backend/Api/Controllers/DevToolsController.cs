using Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Api.Controllers;

[ApiController]
[Route("api/dev")]
public class DevToolsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IWebHostEnvironment _env;

    public DevToolsController(AppDbContext context, IWebHostEnvironment env)
    {
        _context = context;
        _env = env;
    }

    [HttpGet("last-verification-token")]
    public async Task<IActionResult> GetLastVerificationToken([FromQuery] string email)
    {
        if (!_env.IsDevelopment())
        {
            return NotFound();
        }

        if (string.IsNullOrWhiteSpace(email))
        {
            return BadRequest(new { Message = "Email is required." });
        }

        var user = await _context.Usuarios
            .Where(u => u.CorreoElectronico == email)
            .OrderByDescending(u => u.CreatedAtUtc)
            .FirstOrDefaultAsync();

        if (user == null)
        {
            return NotFound(new { Message = $"User with email '{email}' not found." });
        }

        if (string.IsNullOrEmpty(user.TokenVerificacion))
        {
            return Ok(new { Message = "User found, but has no verification token.", EmailVerificado = user.EmailVerificado });
        }

        return Ok(new { Token = user.TokenVerificacion, Email = user.Email, EmailVerificado = user.EmailVerificado });
    }

    [HttpGet("last-email-otp")]
    public async Task<IActionResult> GetLastEmailOtp([FromQuery] string challengeToken)
    {
        if (!_env.IsDevelopment())
        {
            return NotFound();
        }

        if (string.IsNullOrWhiteSpace(challengeToken))
        {
            return BadRequest(new { Message = "challengeToken is required." });
        }

        var otp = await _context.Verificaciones2FA
            .Where(v => v.SesionId == challengeToken)
            .OrderByDescending(v => v.FechaCreacion)
            .FirstOrDefaultAsync();

        if (otp is null)
        {
            return NotFound(new { Message = "No OTP for that challenge." });
        }

        return Ok(new { code = otp.NumeroVerificable, challengeToken });
    }
}
