namespace Api.Controllers;

using System;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Persistence;
using Application.Abstractions.Security;
using Application.Features.Auth.Commands.RegisterUser;
using Domain.Enums;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly RegisterUserCommandHandler _registerHandler;
    private readonly IUsuarioRepository _usuarioRepository;
    private readonly IPasswordHasher _passwordHasher;

    public AuthController(
        RegisterUserCommandHandler registerHandler,
        IUsuarioRepository usuarioRepository,
        IPasswordHasher passwordHasher)
    {
        _registerHandler = registerHandler;
        _usuarioRepository = usuarioRepository;
        _passwordHasher = passwordHasher;
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
    public async Task<IActionResult> Login([FromBody] LoginRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Password))
        {
            return BadRequest(new { Message = "Email y contraseña son requeridos." });
        }

        var user = await _usuarioRepository.GetByEmailAsync(request.Email, cancellationToken);
        if (user == null)
        {
            return Unauthorized(new { Message = "Credenciales inválidas." });
        }

        bool isPasswordValid = _passwordHasher.VerifyPassword(request.Password, user.ContrasenaHash);
        if (!isPasswordValid)
        {
            return Unauthorized(new { Message = "Credenciales inválidas." });
        }

        // Set token as Base64 of the email for identification
        var token = Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes(user.CorreoElectronico));
        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = true, // Force secure cookie
            SameSite = SameSiteMode.Strict,
            Expires = DateTime.UtcNow.AddHours(2),
            Path = "/"
        };
        Response.Cookies.Append("vf_token", token, cookieOptions);

        string roleStr = user.Rol switch
        {
            UserRole.Administrator => "admin",
            UserRole.Professional => "dev",
            UserRole.Consultation => "validator",
            _ => "user"
        };

        return Ok(new
        {
            Message = "Inicio de sesión exitoso.",
            User = new
            {
                Id = user.Id.ToString(),
                Email = user.CorreoElectronico,
                Name = user.NombreCompleto,
                Role = roleStr
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
    public async Task<IActionResult> GetCurrentUser(CancellationToken cancellationToken)
    {
        var token = Request.Cookies["vf_token"];
        if (string.IsNullOrEmpty(token))
        {
            return Unauthorized(new { Message = "No autenticado." });
        }

        try
        {
            var userEmail = System.Text.Encoding.UTF8.GetString(Convert.FromBase64String(token));
            var user = await _usuarioRepository.GetByEmailAsync(userEmail, cancellationToken);
            if (user == null)
            {
                return Unauthorized(new { Message = "Usuario no encontrado." });
            }

            string roleStr = user.Rol switch
            {
                UserRole.Administrator => "admin",
                UserRole.Professional => "dev",
                UserRole.Consultation => "validator",
                _ => "user"
            };

            return Ok(new
            {
                Id = user.Id.ToString(),
                Email = user.CorreoElectronico,
                Name = user.NombreCompleto,
                Role = roleStr
            });
        }
        catch (Exception)
        {
            return Unauthorized(new { Message = "Token inválido." });
        }
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
