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
    private readonly Application.Features.Auth.Commands.UpdatePublicPreferences.UpdatePublicPreferencesCommandHandler _updatePublicPreferencesHandler;
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
        Application.Features.Auth.Commands.UpdatePublicPreferences.UpdatePublicPreferencesCommandHandler updatePublicPreferencesHandler,
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
        _updatePublicPreferencesHandler = updatePublicPreferencesHandler;
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

        if (result.Data!.Requires2fa)
        {
            return Ok(new
            {
                succeeded = false,
                requires2fa = true,
                challengeToken = result.Data.ChallengeToken,
                emailMasked = result.Data.EmailMasked
            });
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

        if (result.Data!.Requires2fa)
        {
            return Ok(new
            {
                succeeded = false,
                requires2fa = true,
                challengeToken = result.Data.ChallengeToken,
                emailMasked = result.Data.EmailMasked
            });
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
            Path = "/",
            MaxAge = TimeSpan.FromDays(1)
        });

        var refreshToken = Guid.NewGuid().ToString("N");
        var sesion = new Domain.Entities.SesionUsuario
        {
            RefreshToken = refreshToken,
            UsuarioId = responseData.User.Id,
            ExpiresAtUtc = DateTime.UtcNow.AddDays(30),
            IsRevoked = false,
            CreatedAtUtc = DateTime.UtcNow
        };
        _context.SesionesUsuario.Add(sesion);
        _context.SaveChanges();

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
                aceptoDescargo = responseData.User.AceptoDescargo,
                isGuest = responseData.User.IsGuest,
                inviterPlan = responseData.User.InviterPlan,
                maxProyectos = responseData.User.MaxProyectos,
                maxUsuariosSecundarios = responseData.User.MaxUsuariosSecundarios,
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
            var user = await _usuarioRepository.GetByIdWithPlanAsync(result.UserId.Value, cancellationToken);
            if (user != null)
            {
                var accessToken = _jwtTokenGenerator.GenerateToken(user);
                var refreshToken = Guid.NewGuid().ToString("N");
                var sesion = new Domain.Entities.SesionUsuario
                {
                    RefreshToken = refreshToken,
                    UsuarioId = user.Id,
                    ExpiresAtUtc = DateTime.UtcNow.AddDays(30),
                    IsRevoked = false,
                    CreatedAtUtc = DateTime.UtcNow
                };
                _context.SesionesUsuario.Add(sesion);
                _context.SaveChanges();

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
                        role = roleStr,
                        maxProyectos = user.Plan?.MaxProyectos ?? 0,
                        maxUsuariosSecundarios = user.Plan?.MaxUsuariosSecundarios ?? 0
                    }
                });
            }
        }

        return Ok(new { Message = "Correo electrónico verificado exitosamente. Ya puede iniciar sesión." });
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout(CancellationToken cancellationToken)
    {
        var refreshToken = Request.Cookies["refreshToken"];
        if (!string.IsNullOrEmpty(refreshToken))
        {
            var sesion = await _context.SesionesUsuario.FirstOrDefaultAsync(s => s.RefreshToken == refreshToken, cancellationToken);
            if (sesion != null)
            {
                sesion.IsRevoked = true;
                await _context.SaveChangesAsync(cancellationToken);
            }
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

        var members = user.MiembrosEquipo
            .Where(m => m.AccountStatus != Domain.Enums.UserAccountStatus.Purged && m.AccountStatus != Domain.Enums.UserAccountStatus.PendingDeletion)
            .ToList();

        var memberIds = members.Select(m => m.Id).ToList();
        var proyectosPorUsuario = await _context.Proyectos
            .Where(p => memberIds.Contains(p.UsuarioCreadorId))
            .GroupBy(p => p.UsuarioCreadorId)
            .Select(g => new { UsuarioId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.UsuarioId, x => x.Count, cancellationToken);
        var consultasPorUsuario = await _context.LogConsultas
            .Where(lc => memberIds.Contains(lc.UsuarioId))
            .GroupBy(lc => lc.UsuarioId)
            .Select(g => new { UsuarioId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.UsuarioId, x => x.Count, cancellationToken);

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
            Direccion = user.Direccion,
            Provincia = user.Provincia,
            Nickname = user.Nickname,
            NombrePublicoModo = NombrePublicoModoToWire(user.NombrePublicoModo),
            IdentificacionPublicaModo = IdentificacionPublicaModoToWire(user.IdentificacionPublicaModo),
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
            MaxProyectos = user.Plan?.MaxProyectos ?? 0,
            AceptoDescargo = user.AceptoDescargo,
            IsGuest = user.TitularId.HasValue,
            TitularId = user.TitularId,
            InviterPlan = user.Titular?.Plan?.NombrePlan,
            InviteesList = members.Select(m => new {
                id = m.Id,
                nombre = m.Nombre,
                apellido = m.Apellido,
                email = m.CorreoElectronico,
                estado = m.AccountStatus == Domain.Enums.UserAccountStatus.Invited ? "Pendiente" : 
                         (!m.EmailVerificado ? "Pendiente" : (m.Activo ? "Activo" : "Inactivo")),
                maxProyectosDelegados = m.MaxProyectosDelegados,
                maxConsultasDelegadas = m.MaxConsultasDelegadas,
                proyectosCreados = proyectosPorUsuario.GetValueOrDefault(m.Id, 0),
                consultasUsadas = consultasPorUsuario.GetValueOrDefault(m.Id, 0)
            })
        });
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh(CancellationToken cancellationToken)
    {
        var token = Request.Cookies["refreshToken"];
        if (string.IsNullOrEmpty(token))
        {
            return Unauthorized(new { Message = "Token de refresco inválido o expirado." });
        }

        var sesion = await _context.SesionesUsuario.FirstOrDefaultAsync(s => s.RefreshToken == token, cancellationToken);
        if (sesion == null || sesion.IsRevoked || sesion.ExpiresAtUtc < DateTime.UtcNow)
        {
            return Unauthorized(new { Message = "Token de refresco inválido o expirado." });
        }

        var userId = sesion.UsuarioId;

        var user = await _usuarioRepository.GetByIdAsync(userId, cancellationToken);
        if (user == null || !user.Activo || user.AccountStatus == Domain.Enums.UserAccountStatus.PendingDeletion)
        {
            return Unauthorized(new { Message = "Usuario no encontrado o inactivo." });
        }

        // Rotate token (single-use)
        sesion.IsRevoked = true;

        // Generate real access token
        var newAccessToken = _jwtTokenGenerator.GenerateToken(user);
        
        var newRefreshToken = Guid.NewGuid().ToString("N");
        var nuevaSesion = new Domain.Entities.SesionUsuario
        {
            RefreshToken = newRefreshToken,
            UsuarioId = userId,
            ExpiresAtUtc = DateTime.UtcNow.AddDays(30),
            IsRevoked = false,
            CreatedAtUtc = DateTime.UtcNow
        };
        _context.SesionesUsuario.Add(nuevaSesion);
        await _context.SaveChangesAsync(cancellationToken);

        // Overwrite the jwt cookie with the new valid token
        Response.Cookies.Append("jwt", newAccessToken, new CookieOptions
        {
            HttpOnly = true,
            Secure = Request.IsHttps,
            SameSite = SameSiteMode.Lax,
            Path = "/",
            MaxAge = TimeSpan.FromDays(1)
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
            expiresIn = 86400 // 24h
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
            request.Cedula,
            request.Rnc,
            request.RazonSocial,
            request.NombreComercial,
            request.ActividadEconomica,
            request.Direccion,
            request.Provincia,
            request.Nickname,
            request.NewPassword
        );

        var result = await _updateProfileHandler.Handle(command, cancellationToken);
        if (!result.IsSuccess)
            return BadRequest(new { Message = result.ErrorMessage });

        return Ok(new { Message = "Perfil actualizado exitosamente." });
    }

    [Microsoft.AspNetCore.Authorization.Authorize]
    [HttpPatch("preferences")]
    public async Task<IActionResult> UpdatePublicPreferences([FromBody] UpdatePublicPreferencesRequestDto request, CancellationToken cancellationToken)
    {
        var idClaim = User.FindFirstValue(System.Security.Claims.ClaimTypes.NameIdentifier) ?? User.FindFirstValue(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub) ?? User.FindFirstValue("sub");
        if (string.IsNullOrEmpty(idClaim) || !Guid.TryParse(idClaim, out var userId))
            return Unauthorized(new { Message = "Token inválido o incompleto." });

        var nombreModo = MapNombreModos(request.NombreModo);
        var identificacionModo = MapIdentificaciones(request.IdentificacionModo);
        if (nombreModo is null || identificacionModo is null)
        {
            return BadRequest(new { Message = "Valores de preferencia inválidos: debe elegir al menos una opción válida por grupo." });
        }

        var command = new Application.Features.Auth.Commands.UpdatePublicPreferences.UpdatePublicPreferencesCommand(userId, nombreModo, identificacionModo);
        var result = await _updatePublicPreferencesHandler.Handle(command, cancellationToken);
        if (!result.IsSuccess)
            return BadRequest(new { Message = result.ErrorMessage });

        return Ok(new { Message = "Preferencias actualizadas exitosamente." });
    }

    private static Domain.Enums.NombrePublicoModo? MapNombreModos(string[]? values)
    {
        if (values is null || values.Length == 0) return null;
        Domain.Enums.NombrePublicoModo result = 0;
        foreach (var value in values)
        {
            var modo = ToNombrePublicoModo(value);
            if (modo is null) return null; // valor desconocido → inválido
            result |= modo.Value;
        }
        return result;
    }

    private static Domain.Enums.IdentificacionPublicaModo? MapIdentificaciones(string[]? values)
    {
        if (values is null || values.Length == 0) return null;
        Domain.Enums.IdentificacionPublicaModo result = 0;
        foreach (var value in values)
        {
            var modo = ToIdentificacionPublicaModo(value);
            if (modo is null) return null;
            result |= modo.Value;
        }
        return result;
    }

    private static Domain.Enums.NombrePublicoModo? ToNombrePublicoModo(string? value) => value switch
    {
        "realName" => Domain.Enums.NombrePublicoModo.RealName,
        "nickname" => Domain.Enums.NombrePublicoModo.Nickname,
        _ => null
    };

    private static Domain.Enums.IdentificacionPublicaModo? ToIdentificacionPublicaModo(string? value) => value switch
    {
        "cedula" => Domain.Enums.IdentificacionPublicaModo.Cedula,
        "rnc" => Domain.Enums.IdentificacionPublicaModo.Rnc,
        _ => null
    };

    private static string[]? NombrePublicoModoToWire(Domain.Enums.NombrePublicoModo? modo)
    {
        if (modo is null) return null;
        var result = new List<string>();
        if (modo.Value.HasFlag(Domain.Enums.NombrePublicoModo.RealName)) result.Add("realName");
        if (modo.Value.HasFlag(Domain.Enums.NombrePublicoModo.Nickname)) result.Add("nickname");
        return result.ToArray();
    }

    private static string[]? IdentificacionPublicaModoToWire(Domain.Enums.IdentificacionPublicaModo? modo)
    {
        if (modo is null) return null;
        var result = new List<string>();
        if (modo.Value.HasFlag(Domain.Enums.IdentificacionPublicaModo.Cedula)) result.Add("cedula");
        if (modo.Value.HasFlag(Domain.Enums.IdentificacionPublicaModo.Rnc)) result.Add("rnc");
        return result.ToArray();
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
    public string? Cedula { get; set; }
    public string? Rnc { get; set; }
    public string? RazonSocial { get; set; }
    public string? NombreComercial { get; set; }
    public string? ActividadEconomica { get; set; }
    public string? Direccion { get; set; }
    public string? Provincia { get; set; }
    public string? Nickname { get; set; }
    public string? NewPassword { get; set; }
}

public class UpdatePublicPreferencesRequestDto
{
    public string[]? NombreModo { get; set; }
    public string[]? IdentificacionModo { get; set; }
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
