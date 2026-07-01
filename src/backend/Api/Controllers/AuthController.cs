using System;
using System.Collections.Concurrent;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;

namespace Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly Application.Features.Auth.Commands.RegisterUser.RegisterUserCommandHandler _registerHandler;
    private readonly Application.Features.Auth.Commands.VerifyEmail.VerifyEmailCommandHandler _verifyHandler;
    private readonly Application.Features.Auth.Commands.LoginUser.LoginUserCommandHandler _loginHandler;
    private readonly Application.Features.Auth.Commands.UpdateProfile.UpdateProfileCommandHandler _updateProfileHandler;
    private readonly Application.Abstractions.Persistence.IUsuarioRepository _usuarioRepository;
    private readonly IConfiguration _configuration;
    private readonly Application.Abstractions.Security.IJwtTokenGenerator _jwtTokenGenerator;
    private static readonly ConcurrentDictionary<string, string> _refreshTokens = new();

    public AuthController(
        Application.Features.Auth.Commands.RegisterUser.RegisterUserCommandHandler registerHandler,
        Application.Features.Auth.Commands.VerifyEmail.VerifyEmailCommandHandler verifyHandler,
        Application.Features.Auth.Commands.LoginUser.LoginUserCommandHandler loginHandler,
        Application.Features.Auth.Commands.UpdateProfile.UpdateProfileCommandHandler updateProfileHandler,
        Application.Abstractions.Persistence.IUsuarioRepository usuarioRepository,
        IConfiguration configuration,
        Application.Abstractions.Security.IJwtTokenGenerator jwtTokenGenerator)
    {
        _registerHandler = registerHandler;
        _verifyHandler = verifyHandler;
        _loginHandler = loginHandler;
        _updateProfileHandler = updateProfileHandler;
        _usuarioRepository = usuarioRepository;
        _configuration = configuration;
        _jwtTokenGenerator = jwtTokenGenerator;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequestDto request, CancellationToken cancellationToken)
    {
        var command = new Application.Features.Auth.Commands.RegisterUser.RegisterUserCommand(
            request.Nombre ?? string.Empty,
            request.Apellido ?? request.Apellidos ?? string.Empty,
            request.Email ?? request.CorreoElectronico ?? string.Empty,
            request.Password ?? request.Contrasena ?? string.Empty,
            request.Telefono ?? "8095550199",
            request.Cedula ?? "40212345678",
            request.ReturnUrl
        );
        var result = await _registerHandler.Handle(command, cancellationToken);
        
        if (!result.IsSuccess)
        {
            return BadRequest(new { Message = result.ErrorMessage });
        }

        return Ok(result);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] Application.Features.Auth.Commands.LoginUser.LoginUserCommand request, CancellationToken cancellationToken)
    {
        var result = await _loginHandler.Handle(request, cancellationToken);
        if (!result.IsSuccess)
        {
            return BadRequest(new { Message = result.ErrorMessage, succeeded = false });
        }

        var responseData = result.Data;
        if (responseData == null)
        {
            return BadRequest(new { Message = "Error al generar sesión." });
        }

        Response.Cookies.Append("jwt", responseData.Token, new CookieOptions
        {
            HttpOnly = true,
            Secure = Request.IsHttps,
            SameSite = SameSiteMode.Lax,
            Path = "/"
        });

        var refreshToken = Guid.NewGuid().ToString("N");
        _refreshTokens[refreshToken] = responseData.User.Id.ToString();

        Response.Cookies.Append("refreshToken", refreshToken, new CookieOptions
        {
            HttpOnly = true,
            Secure = Request.IsHttps,
            SameSite = SameSiteMode.Lax,
            Path = "/api/auth/refresh",
            MaxAge = TimeSpan.FromDays(30)
        });

        return Ok(new
        {
            succeeded = true,
            accessToken = responseData.Token,
            user = new
            {
                id = responseData.User.Id,
                name = responseData.User.Name,
                email = responseData.User.Email,
                role = responseData.User.Role
            }
        });
    }

    [HttpGet("verify")]
    public async Task<IActionResult> Verify([FromQuery] string token, CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(token))
            return BadRequest(new { Message = "Token vacío." });

        var command = new Application.Features.Auth.Commands.VerifyEmail.VerifyEmailCommand(token);
        var result = await _verifyHandler.Handle(command, cancellationToken);
        
        if (!result.IsSuccess)
        {
            return BadRequest(new { Message = result.ErrorMessage });
        }

        if (result.UserId.HasValue)
        {
            var user = await _usuarioRepository.GetByIdAsync(result.UserId.Value, cancellationToken);
            if (user != null)
            {
                var accessToken = _jwtTokenGenerator.GenerateToken(user);
                var refreshToken = Guid.NewGuid().ToString("N");
                _refreshTokens[refreshToken] = user.Id.ToString();

                Response.Cookies.Append("jwt", accessToken, new CookieOptions
                {
                    HttpOnly = true,
                    Secure = Request.IsHttps,
                    SameSite = SameSiteMode.Lax,
                    Path = "/"
                });

                Response.Cookies.Append("refreshToken", refreshToken, new CookieOptions
                {
                    HttpOnly = true,
                    Secure = Request.IsHttps,
                    SameSite = SameSiteMode.Lax,
                    Path = "/api/auth/refresh",
                    MaxAge = TimeSpan.FromDays(30)
                });

                var roleStr = user.Rol switch
                {
                    Domain.Enums.UserRole.Administrator => "admin",
                    Domain.Enums.UserRole.User => "user",
                    _ => "user"
                };

                return Ok(new
                {
                    Message = "Correo electrónico verificado exitosamente.",
                    succeeded = true,
                    accessToken = accessToken,
                    user = new
                    {
                        id = user.Id,
                        name = user.Nombre,
                        email = user.CorreoElectronico,
                        role = roleStr
                    }
                });
            }
        }

        return Ok(new { Message = "Correo electrónico verificado exitosamente. Ya puede iniciar sesión." });
    }

    [HttpPost("logout")]
    public IActionResult Logout()
    {
        var refreshToken = Request.Cookies["refreshToken"];
        if (!string.IsNullOrEmpty(refreshToken))
        {
            _refreshTokens.TryRemove(refreshToken, out _);
        }

        Response.Cookies.Append("jwt", "", new CookieOptions
        {
            HttpOnly = true,
            Secure = Request.IsHttps,
            SameSite = SameSiteMode.Lax,
            Path = "/",
            Expires = DateTimeOffset.UtcNow.AddDays(-1)
        });

        Response.Cookies.Append("refreshToken", "", new CookieOptions
        {
            HttpOnly = true,
            Secure = Request.IsHttps,
            SameSite = SameSiteMode.Lax,
            Path = "/api/auth/refresh",
            Expires = DateTimeOffset.UtcNow.AddDays(-1)
        });

        return Ok(new { Message = "Sesión cerrada exitosamente." });
    }

    [Microsoft.AspNetCore.Authorization.Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> GetCurrentUser(CancellationToken cancellationToken)
    {
        var idClaim = User.FindFirstValue(System.Security.Claims.ClaimTypes.NameIdentifier) ?? User.FindFirstValue(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub) ?? User.FindFirstValue("sub");

        if (string.IsNullOrEmpty(idClaim) || !Guid.TryParse(idClaim, out var userId))
        {
            return Unauthorized(new { Message = "Token inválido o incompleto." });
        }

        var user = await _usuarioRepository.GetByIdWithPlanAsync(userId, cancellationToken);
        if (user == null)
        {
            return Unauthorized(new { Message = "Usuario no encontrado." });
        }

        var roleStr = user.Rol switch
        {
            Domain.Enums.UserRole.Administrator => "admin",
            Domain.Enums.UserRole.User => "user",
            _ => "user"
        };

        return Ok(new
        {
            Id = user.Id.ToString(),
            Email = user.CorreoElectronico,
            Nombre = user.Nombre,
            Apellido = user.Apellido,
            Role = roleStr,
            Cedula = user.Cedula ?? string.Empty,
            Telefono = user.Telefono ?? string.Empty,
            Plan = user.Plan?.NombrePlan ?? "N/A",
            SubscriptionStatus = user.SubscriptionStatus ?? "N/A",
            CurrentPeriodEnd = user.CurrentPeriodEnd
        });
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh(CancellationToken cancellationToken)
    {
        var token = Request.Cookies["refreshToken"];
        if (string.IsNullOrEmpty(token) || !_refreshTokens.TryGetValue(token, out var userIdStr))
        {
            return Unauthorized(new { Message = "Token de refresco inválido o expirado." });
        }

        if (!Guid.TryParse(userIdStr, out var userId))
        {
            return Unauthorized(new { Message = "Token de refresco inválido." });
        }

        var user = await _usuarioRepository.GetByIdAsync(userId, cancellationToken);
        if (user == null || !user.Activo)
        {
            return Unauthorized(new { Message = "Usuario no encontrado o inactivo." });
        }

        // Rotate token (single-use)
        _refreshTokens.TryRemove(token, out _);

        // Generate real access token
        var newAccessToken = _jwtTokenGenerator.GenerateToken(user);
        
        var newRefreshToken = Guid.NewGuid().ToString("N");
        _refreshTokens[newRefreshToken] = userId.ToString();

        // Overwrite the jwt cookie with the new valid token
        Response.Cookies.Append("jwt", newAccessToken, new CookieOptions
        {
            HttpOnly = true,
            Secure = Request.IsHttps,
            SameSite = SameSiteMode.Lax,
            Path = "/"
        });

        Response.Cookies.Append("refreshToken", newRefreshToken, new CookieOptions
        {
            HttpOnly = true,
            Secure = Request.IsHttps,
            SameSite = SameSiteMode.Lax,
            Path = "/api/auth/refresh",
            MaxAge = TimeSpan.FromDays(30)
        });

        return Ok(new
        {
            accessToken = newAccessToken,
            expiresIn = 3600 // 1 hour per appsettings
        });
    }
    [Microsoft.AspNetCore.Authorization.Authorize]
    [HttpPatch("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequestDto request, CancellationToken cancellationToken)
    {
        var idClaim = User.FindFirstValue(System.Security.Claims.ClaimTypes.NameIdentifier) ?? User.FindFirstValue(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub) ?? User.FindFirstValue("sub");
        if (string.IsNullOrEmpty(idClaim) || !Guid.TryParse(idClaim, out var userId))
            return Unauthorized(new { Message = "Token inválido o incompleto." });

        var command = new Application.Features.Auth.Commands.UpdateProfile.UpdateProfileCommand(
            userId,
            request.Nombre,
            request.Apellido,
            request.Telefono,
            request.CurrentPassword,
            request.NewPassword
        );

        var result = await _updateProfileHandler.Handle(command, cancellationToken);
        if (!result.IsSuccess)
            return BadRequest(new { Message = result.ErrorMessage });

        return Ok(new { Message = "Perfil actualizado exitosamente." });
    }
}

public class UpdateProfileRequestDto
{
    public string? Nombre { get; set; }
    public string? Apellido { get; set; }
    public string? Telefono { get; set; }
    public string? CurrentPassword { get; set; }
    public string? NewPassword { get; set; }
}

public class RegisterRequestDto
{
    public string? Nombre { get; set; }
    public string? Apellidos { get; set; }
    public string? Apellido { get; set; }
    public string? Email { get; set; }
    public string? CorreoElectronico { get; set; }
    public string? Password { get; set; }
    public string? Contrasena { get; set; }
    public string? Telefono { get; set; }
    public string? Cedula { get; set; }
    public string? ReturnUrl { get; set; }
}
