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
using System.Security.Claims;
using Microsoft.Extensions.Configuration;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly RegisterUserCommandHandler _registerHandler;
    private readonly Application.Features.Auth.Commands.LoginUser.LoginUserCommandHandler _loginHandler;
    private readonly Application.Features.Auth.Commands.VerifyEmail.VerifyEmailCommandHandler _verifyHandler;
    private readonly IConfiguration _configuration;

    public AuthController(
        RegisterUserCommandHandler registerHandler,
        Application.Features.Auth.Commands.LoginUser.LoginUserCommandHandler loginHandler,
        Application.Features.Auth.Commands.VerifyEmail.VerifyEmailCommandHandler verifyHandler,
        IConfiguration configuration)
    {
        _registerHandler = registerHandler;
        _loginHandler = loginHandler;
        _verifyHandler = verifyHandler;
        _configuration = configuration;
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
    public async Task<IActionResult> Login([FromBody] Application.Features.Auth.Commands.LoginUser.LoginUserCommand request, CancellationToken cancellationToken)
    {
        var result = await _loginHandler.Handle(request, cancellationToken);
        if (!result.IsSuccess)
        {
            return Unauthorized(new { Message = result.ErrorMessage });
        }

        var responseData = result.Data;
        if (responseData == null)
        {
            return Unauthorized(new { Message = "Error al obtener datos de sesión." });
        }

        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = Request.IsHttps,
            SameSite = SameSiteMode.Strict,
            Expires = DateTime.UtcNow.AddHours(2),
            Path = "/"
        };
        Response.Cookies.Append("vf_token", responseData.Token, cookieOptions);

        return Ok(new
        {
            Message = "Inicio de sesión exitoso.",
            User = new
            {
                Id = responseData.User.Id.ToString(),
                Email = responseData.User.Email,
                Name = responseData.User.Name,
                Role = responseData.User.Role
            }
        });
    }

    [HttpGet("verify")]
    public async Task<IActionResult> Verify([FromQuery] string token, CancellationToken cancellationToken)
    {
        var command = new Application.Features.Auth.Commands.VerifyEmail.VerifyEmailCommand(token);
        var result = await _verifyHandler.Handle(command, cancellationToken);
        
        var frontendUrl = _configuration["PublicPortalBaseUrl"] ?? "http://localhost:3000";
        
        if (!result.IsSuccess)
        {
            var errorMessage = Uri.EscapeDataString(result.ErrorMessage ?? "verification_failed");
            return Redirect($"{frontendUrl}/login?error={errorMessage}");
        }

        return Redirect($"{frontendUrl}/login?verified=true");
    }

    [HttpPost("logout")]
    public IActionResult Logout()
    {
        Response.Cookies.Delete("vf_token", new CookieOptions
        {
            HttpOnly = true,
            Secure = Request.IsHttps,
            SameSite = SameSiteMode.Strict,
            Path = "/"
        });

        return Ok(new { Message = "Sesión cerrada exitosamente." });
    }

    [Microsoft.AspNetCore.Authorization.Authorize]
    [HttpGet("me")]
    public IActionResult GetCurrentUser()
    {
        var idClaim = User.FindFirstValue(System.Security.Claims.ClaimTypes.NameIdentifier) ?? User.FindFirstValue(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub);
        var emailClaim = User.FindFirstValue(System.Security.Claims.ClaimTypes.Email) ?? User.FindFirstValue(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Email);
        var nameClaim = User.FindFirstValue(System.Security.Claims.ClaimTypes.Name) ?? User.FindFirstValue(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Name);
        var roleClaim = User.FindFirstValue(System.Security.Claims.ClaimTypes.Role);

        if (string.IsNullOrEmpty(idClaim) || string.IsNullOrEmpty(emailClaim))
        {
            return Unauthorized(new { Message = "Token inválido o incompleto." });
        }

        return Ok(new
        {
            Id = idClaim,
            Email = emailClaim,
            Name = nameClaim ?? string.Empty,
            Role = roleClaim ?? "user"
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


