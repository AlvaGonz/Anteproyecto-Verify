using System;
using System.Collections.Concurrent;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.EntityFrameworkCore;
using Infrastructure.Persistence;

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
    private readonly Application.Features.Auth.Commands.UploadAvatar.UploadAvatarCommandHandler _uploadAvatarHandler;
    private readonly Application.Features.Auth.Commands.ResendVerificationEmail.ResendVerificationEmailCommandHandler _resendVerificationHandler;
    private readonly Application.Features.Auth.Commands.ForgotPassword.ForgotPasswordCommandHandler _forgotPasswordHandler;
    private readonly Application.Features.Auth.Commands.ResetPassword.ResetPasswordCommandHandler _resetPasswordHandler;
    private static readonly ConcurrentDictionary<string, string> _refreshTokens = new();
    private readonly IMemoryCache _cache;
    private readonly AppDbContext _context;

    public AuthController(
        Application.Features.Auth.Commands.RegisterUser.RegisterUserCommandHandler registerHandler,
        Application.Features.Auth.Commands.VerifyEmail.VerifyEmailCommandHandler verifyHandler,
        Application.Features.Auth.Commands.LoginUser.LoginUserCommandHandler loginHandler,
        Application.Features.Auth.Commands.UpdateProfile.UpdateProfileCommandHandler updateProfileHandler,
        Application.Features.Auth.Commands.UploadAvatar.UploadAvatarCommandHandler uploadAvatarHandler,
        Application.Features.Auth.Commands.ResendVerificationEmail.ResendVerificationEmailCommandHandler resendVerificationHandler,
        Application.Features.Auth.Commands.ForgotPassword.ForgotPasswordCommandHandler forgotPasswordHandler,
        Application.Features.Auth.Commands.ResetPassword.ResetPasswordCommandHandler resetPasswordHandler,
        Application.Abstractions.Persistence.IUsuarioRepository usuarioRepository,
        IConfiguration configuration,
        Application.Abstractions.Security.IJwtTokenGenerator jwtTokenGenerator,
        IMemoryCache cache,
        AppDbContext context)
    {
        _registerHandler = registerHandler;
        _verifyHandler = verifyHandler;
        _loginHandler = loginHandler;
        _updateProfileHandler = updateProfileHandler;
        _uploadAvatarHandler = uploadAvatarHandler;
        _resendVerificationHandler = resendVerificationHandler;
        _forgotPasswordHandler = forgotPasswordHandler;
        _resetPasswordHandler = resetPasswordHandler;
        _usuarioRepository = usuarioRepository;
        _configuration = configuration;
        _jwtTokenGenerator = jwtTokenGenerator;
        _cache = cache;
        _context = context;
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
            request.ReturnUrl,
            request.PendingPlanCode,
            request.PendingBillingCycle
        );
        var result = await _registerHandler.Handle(command, cancellationToken);
        
        if (!result.IsSuccess)
        {
            return BadRequest(new { Message = result.ErrorMessage });
        }

        return Ok(result);
    }

    [HttpPost("resend-verification")]
    public async Task<IActionResult> ResendVerification([FromBody] Application.Features.Auth.Commands.ResendVerificationEmail.ResendVerificationEmailCommand request, CancellationToken cancellationToken)
    {
        var result = await _resendVerificationHandler.Handle(request, cancellationToken);
        
        if (!result.IsSuccess)
        {
            return BadRequest(new { Message = result.ErrorMessage });
        }

        return Ok(new { Message = "Correo de verificación reenviado exitosamente." });
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] Application.Features.Auth.Commands.ForgotPassword.ForgotPasswordCommand request, CancellationToken cancellationToken)
    {
        var result = await _forgotPasswordHandler.Handle(request, cancellationToken);
        
        if (!result.IsSuccess)
        {
            return BadRequest(new { Message = result.ErrorMessage });
        }

        return Ok(new { Message = "Si el correo está registrado, se han enviado las instrucciones para restablecer la contraseña." });
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] Application.Features.Auth.Commands.ResetPassword.ResetPasswordCommand request, CancellationToken cancellationToken)
    {
        var result = await _resetPasswordHandler.Handle(request, cancellationToken);
        
        if (!result.IsSuccess)
        {
            return BadRequest(new { Message = result.ErrorMessage });
        }

        return Ok(new { Message = "Contraseña restablecida exitosamente." });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] Application.Features.Auth.Commands.LoginUser.LoginUserCommand request, CancellationToken cancellationToken)
    {
        var result = await _loginHandler.Handle(request, cancellationToken);
        if (!result.IsSuccess)
        {
            return BadRequest(new { Message = result.ErrorMessage, succeeded = false });
        }

        return GenerateSessionCookiesAndResponse(result.Data);
    }

    [HttpPost("google")]
    public async Task<IActionResult> GoogleLogin([FromBody] Application.Features.Auth.Commands.GoogleLoginUser.GoogleLoginUserCommand request, CancellationToken cancellationToken)
    {
        var handler = HttpContext.RequestServices.GetRequiredService<Application.Features.Auth.Commands.GoogleLoginUser.GoogleLoginUserCommandHandler>();
        var result = await handler.Handle(request, cancellationToken);
        
        if (!result.IsSuccess)
        {
            return BadRequest(new { Message = result.ErrorMessage, succeeded = false });
        }

        return GenerateSessionCookiesAndResponse(result.Data);
    }

    private IActionResult GenerateSessionCookiesAndResponse(Application.Features.Auth.Commands.LoginUser.LoginUserResponseDto? responseData)
    {
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
        _cache.Set(refreshToken, responseData.User.Id.ToString(), TimeSpan.FromDays(30));

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
                role = responseData.User.Role,
                avatarUrl = responseData.User.AvatarUrl,
                subscriptionStatus = responseData.User.SubscriptionStatus,
                pendingPlanCode = responseData.User.PendingPlanCode,
                isGuest = responseData.User.IsGuest,
                inviterPlan = responseData.User.InviterPlan,
                inviteesList = responseData.User.InviteesList
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
                _cache.Set(refreshToken, user.Id.ToString(), TimeSpan.FromDays(30));

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
            _cache.Remove(refreshToken);
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

        // DGII lookup by RNC first, fallback to Cedula (individuals use cédula as RNC)
        var lookupKey = !string.IsNullOrWhiteSpace(user.Rnc) ? user.Rnc : user.Cedula;
        Domain.Entities.DGII? dgii = null;
        if (!string.IsNullOrWhiteSpace(lookupKey))
        {
            var cleanKey = lookupKey.Replace("-", "");
            dgii = await _context.DGII
                .AsNoTracking()
                .FirstOrDefaultAsync(d => d.Rnc == cleanKey, cancellationToken);
        }

        return Ok(new
        {
            Id = user.Id.ToString(),
            Email = user.CorreoElectronico,
            Nombre = user.Nombre,
            Apellido = user.Apellido,
            Role = roleStr,
            Cedula = user.Cedula ?? string.Empty,
            Telefono = user.Telefono ?? string.Empty,
            Rnc = user.Rnc,
            RazonSocial = user.RazonSocial ?? dgii?.NombreRazonSocial,
            NombreComercial = user.NombreComercial ?? dgii?.NombreComercial,
            ActividadEconomica = user.ActividadEconomica ?? dgii?.ActividadEconomica,
            Plan = user.Plan?.NombrePlan ?? "N/A",
            AvatarUrl = user.AvatarUrl,
            SubscriptionStatus = user.SubscriptionStatus ?? "N/A",
            CurrentPeriodEnd = user.CurrentPeriodEnd,
            PendingPlanCode = user.PendingPlanCode,
            PendingBillingCycle = user.PendingBillingCycle,
            MaxUsuariosSecundarios = user.Plan?.MaxUsuariosSecundarios ?? 0,
            IsGuest = user.TitularId.HasValue,
            InviterPlan = user.Titular?.Plan?.NombrePlan,
            InviteesList = user.MiembrosEquipo
                .Where(m => m.AccountStatus != Domain.Enums.UserAccountStatus.Purged && m.AccountStatus != Domain.Enums.UserAccountStatus.PendingDeletion)
                .Select(m => new {
                    id = m.Id,
                    nombre = m.Nombre,
                    apellido = m.Apellido,
                    email = m.CorreoElectronico,
                    estado = m.AccountStatus == Domain.Enums.UserAccountStatus.Invited ? "Pendiente" : 
                             (!m.EmailVerificado ? "Pendiente" : (m.Activo ? "Activo" : "Inactivo")),
                    maxProyectosDelegados = m.MaxProyectosDelegados,
                    maxConsultasDelegadas = m.MaxConsultasDelegadas,
                    proyectosCreados = m.ProyectosCreados,
                    consultasUsadas = m.ConsultasUsadas
                })
        });
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh(CancellationToken cancellationToken)
    {
        var token = Request.Cookies["refreshToken"];
        if (string.IsNullOrEmpty(token) || !_cache.TryGetValue(token, out string? userIdStr) || userIdStr == null)
        {
            return Unauthorized(new { Message = "Token de refresco inválido o expirado." });
        }

        if (!Guid.TryParse(userIdStr, out var userId))
        {
            return Unauthorized(new { Message = "Token de refresco inválido." });
        }

        var user = await _usuarioRepository.GetByIdAsync(userId, cancellationToken);
        if (user == null || !user.Activo || user.AccountStatus == Domain.Enums.UserAccountStatus.PendingDeletion)
        {
            return Unauthorized(new { Message = "Usuario no encontrado o inactivo." });
        }

        // Rotate token (single-use)
        _cache.Remove(token);

        // Generate real access token
        var newAccessToken = _jwtTokenGenerator.GenerateToken(user);
        
        var newRefreshToken = Guid.NewGuid().ToString("N");
        _cache.Set(newRefreshToken, userId.ToString(), TimeSpan.FromDays(30));

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
            request.Rnc,
            request.RazonSocial,
            request.NombreComercial,
            request.ActividadEconomica,
            request.CurrentPassword,
            request.NewPassword
        );

        var result = await _updateProfileHandler.Handle(command, cancellationToken);
        if (!result.IsSuccess)
            return BadRequest(new { Message = result.ErrorMessage });

        return Ok(new { Message = "Perfil actualizado exitosamente." });
    }

    [Microsoft.AspNetCore.Authorization.Authorize]
    [HttpPost("me/avatar")]
    public async Task<IActionResult> UploadAvatar(IFormFile file, CancellationToken cancellationToken)
    {
        var idClaim = User.FindFirstValue(System.Security.Claims.ClaimTypes.NameIdentifier) ?? User.FindFirstValue(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub) ?? User.FindFirstValue("sub");
        if (string.IsNullOrEmpty(idClaim) || !Guid.TryParse(idClaim, out var userId))
            return Unauthorized(new { Message = "Token inválido o incompleto." });

        if (file == null || file.Length == 0)
            return BadRequest(new { Message = "Debe proporcionar una imagen." });

        if (file.Length > 5 * 1024 * 1024)
            return BadRequest(new { Message = "La imagen no debe exceder los 5MB." });

        using var stream = file.OpenReadStream();
        var command = new Application.Features.Auth.Commands.UploadAvatar.UploadAvatarCommand(
            userId,
            stream,
            file.FileName,
            file.ContentType
        );

        var result = await _uploadAvatarHandler.Handle(command, cancellationToken);
        if (!result.IsSuccess)
            return BadRequest(new { Message = result.ErrorMessage });

        return Ok(new { Message = "Avatar actualizado.", Url = result.Data });
    }
}

public class UpdateProfileRequestDto
{
    public string? Nombre { get; set; }
    public string? Apellido { get; set; }
    public string? Telefono { get; set; }
    public string? Rnc { get; set; }
    public string? RazonSocial { get; set; }
    public string? NombreComercial { get; set; }
    public string? ActividadEconomica { get; set; }
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
    public string? PendingPlanCode { get; set; }
    public string? PendingBillingCycle { get; set; }
}
