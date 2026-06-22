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
            return BadRequest("Email is required.");
        }

        var user = await _context.Usuarios
            .Where(u => u.Email == email)
            .OrderByDescending(u => u.FechaRegistroUtc)
            .FirstOrDefaultAsync();

        if (user == null)
        {
            return NotFound($"User with email '{email}' not found.");
        }

        if (string.IsNullOrEmpty(user.TokenVerificacion))
        {
            return Ok(new { Message = "User found, but has no verification token.", EmailVerificado = user.EmailVerificado });
        }

        return Ok(new { Token = user.TokenVerificacion, Email = user.Email, EmailVerificado = user.EmailVerificado });
    }
}
