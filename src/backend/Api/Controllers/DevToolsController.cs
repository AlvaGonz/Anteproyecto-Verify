using Infrastructure.Persistence;
using Microsoft.AspNetCore.DataProtection;
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

    [HttpGet("current-totp")]
    public IActionResult GetCurrentTotp([FromQuery] string secret)
    {
        if (!_env.IsDevelopment())
        {
            return NotFound();
        }
        if (string.IsNullOrWhiteSpace(secret))
        {
            return BadRequest(new { Message = "secret is required." });
        }

        var key = ConvertFromBase32(secret);
        if (key.Length == 0)
        {
            return BadRequest(new { Message = "Invalid base32 secret." });
        }

        var code = ComputeCode(key, DateTime.UtcNow);
        return Ok(new { code, secret });
    }

    [HttpGet("current-totp-by-email")]
    public async Task<IActionResult> GetCurrentTotpByEmail([FromQuery] string email)
    {
        if (!_env.IsDevelopment())
        {
            return NotFound();
        }
        if (string.IsNullOrWhiteSpace(email))
        {
            return BadRequest(new { Message = "email is required." });
        }

        var user = await _context.Usuarios
            .Where(u => u.CorreoElectronico == email)
            .OrderByDescending(u => u.CreatedAtUtc)
            .FirstOrDefaultAsync();

        if (user is null || string.IsNullOrWhiteSpace(user.TwoFactorSecretEncrypted))
        {
            return NotFound(new { Message = "User has no TOTP secret." });
        }

        // Decrypt via the same DataProtection provider used at enrollment time.
        var provider = HttpContext.RequestServices.GetRequiredService<IDataProtectionProvider>();
        var protector = provider.CreateProtector("TwoFactorSecret");
        var plain = protector.Unprotect(user.TwoFactorSecretEncrypted);
        var key = ConvertFromBase32(plain);
        if (key.Length == 0)
        {
            return BadRequest(new { Message = "Stored TOTP secret invalid." });
        }

        var code = ComputeCode(key, DateTime.UtcNow);
        return Ok(new { code, email });
    }

    private static string ComputeCode(byte[] key, DateTime utcNow)
    {
        var counter = (long)(utcNow - DateTime.UnixEpoch).TotalSeconds / 30;
        Span<byte> counterBytes = stackalloc byte[8];
        System.Buffers.Binary.BinaryPrimitives.WriteInt64BigEndian(counterBytes, counter);

        using var hmac = new System.Security.Cryptography.HMACSHA1(key);
        var hash = hmac.ComputeHash(counterBytes.ToArray());
        var offset = hash[hash.Length - 1] & 0x0F;
        var binary = ((hash[offset] & 0x7F) << 24)
                   | ((hash[offset + 1] & 0xFF) << 16)
                   | ((hash[offset + 2] & 0xFF) << 8)
                   | (hash[offset + 3] & 0xFF);
        return (binary % 1000000).ToString("D6");
    }

[HttpGet("resend-config")]
        public IActionResult GetResendConfig()
        {
            var config = HttpContext.RequestServices.GetRequiredService<IConfiguration>();
            var env = HttpContext.RequestServices.GetRequiredService<IWebHostEnvironment>();
            var section = config.GetSection("Resend");
            var apiToken = section.GetValue<string>("ApiToken") ?? "NOT_FOUND";
            var fromEmail = section.GetValue<string>("FromEmail") ?? "NOT_FOUND";
            var fromName = section.GetValue<string>("FromName") ?? "NOT_FOUND";
            var envName = env.EnvironmentName;

            return Ok(new { apiToken, fromEmail, fromName, envName });
        }

    [HttpGet("ping")]
    public IActionResult Ping([FromQuery] string? test = null) => Ok(new { pong = true, time = DateTime.UtcNow, test });

    private static byte[] ConvertFromBase32(string s)
    {
        const string alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
        s = s.Trim().Replace(" ", "").ToUpperInvariant();
        var bytes = new List<byte>(s.Length * 5 / 8);
        int buffer = 0, bitsLeft = 0;
        foreach (var c in s)
        {
            int idx = alphabet.IndexOf(c);
            if (idx < 0) return Array.Empty<byte>();
            buffer <<= 5;
            buffer |= idx;
            bitsLeft += 5;
            if (bitsLeft >= 8)
            {
                bitsLeft -= 8;
                bytes.Add((byte)((buffer >> bitsLeft) & 0xFF));
            }
        }
        return bytes.ToArray();
    }
}
