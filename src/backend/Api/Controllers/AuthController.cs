namespace Api.Controllers;

using System;
using System.Threading;
using System.Threading.Tasks;
using Application.Features.Auth.Commands.RegisterUser;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly RegisterUserCommandHandler _registerHandler;

    public AuthController(RegisterUserCommandHandler registerHandler)
    {
        _registerHandler = registerHandler;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterUserCommand command, CancellationToken cancellationToken)
    {
        var result = await _registerHandler.Handle(command, cancellationToken);
        
        if (!result.IsSuccess)
        {
            return BadRequest(new { Message = result.ErrorMessage });
        }

        return Ok(new 
        { 
            Message = "Usuario registrado exitosamente.", 
            UsuarioId = result.UsuarioId 
        });
    }

    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginRequest request)
    {
        if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Password))
        {
            return BadRequest(new { Message = "Email y contraseña son requeridos." });
        }

        // Mock authentication check for the demo
        if (request.Email == "admin@verifinca.com" && request.Password != "admin123")
        {
            return Unauthorized(new { Message = "Credenciales inválidas." });
        }

        // Set JWT inside HttpOnly, Secure, SameSite=Strict cookie
        var token = "mock-jwt-token-from-cookie";
        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = true, // Force secure cookie
            SameSite = SameSiteMode.Strict,
            Expires = DateTime.UtcNow.AddHours(2),
            Path = "/"
        };
        Response.Cookies.Append("vf_token", token, cookieOptions);

        return Ok(new
        {
            Message = "Inicio de sesión exitoso.",
            User = new
            {
                Id = "1",
                Email = request.Email,
                Name = request.Email == "admin@verifinca.com" ? "Administrador VeriFinca" : "Usuario Demo",
                Role = request.Email == "admin@verifinca.com" ? "admin" : "user"
            }
        });
    }

    [HttpPost("logout")]
    public IActionResult Logout()
    {
        Response.Cookies.Delete("vf_token", new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Path = "/"
        });

        return Ok(new { Message = "Sesión cerrada exitosamente." });
    }

    [HttpGet("me")]
    public IActionResult GetCurrentUser()
    {
        var token = Request.Cookies["vf_token"];
        if (string.IsNullOrEmpty(token))
        {
            return Unauthorized(new { Message = "No autenticado." });
        }

        return Ok(new
        {
            Id = "1",
            Email = "admin@verifinca.com",
            Name = "Administrador VeriFinca",
            Role = "admin"
        });
    }

    [HttpPost("refresh")]
    public IActionResult Refresh()
    {
        var token = Request.Cookies["vf_token"];
        if (string.IsNullOrEmpty(token))
        {
            return Unauthorized(new { Message = "Token de refresco inválido o expirado." });
        }

        // Generate new access token
        var newAccessToken = "mock-new-jwt-token";
        return Ok(new
        {
            AccessToken = newAccessToken,
            ExpiresIn = 7200
        });
    }
}

public class LoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}
