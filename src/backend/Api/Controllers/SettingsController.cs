namespace Api.Controllers;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Persistence;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

/// <summary>
/// Response DTO for admin user settings with profile and plan information
/// </summary>
public record AdminUserSettingsDto(
    Guid Id,
    string Nombre,
    string Apellido,
    string Email,
    string Role,
    string Telefono,
    string Cedula,
    Guid? ProfileId,
    string ProfileName,
    Guid? PlanId,
    string PlanName,
    decimal? PlanPrice
);

/// <summary>
/// Paginated response wrapper
/// </summary>
public record PaginatedResponse<T>(
    IReadOnlyList<T> Items,
    int TotalCount,
    int Page,
    int PageSize
);

[Microsoft.AspNetCore.Authorization.Authorize]
[ApiController]
[Route("api/admin")]
public class SettingsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly Application.Abstractions.Security.IPasswordHasher _passwordHasher;

    public SettingsController(AppDbContext context, Application.Abstractions.Security.IPasswordHasher passwordHasher)
    {
        _context = context;
        _passwordHasher = passwordHasher;
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetUsers(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        CancellationToken cancellationToken = default)
    {
        if (!await IsAdminAsync())
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { Message = "Acceso denegado. Se requieren permisos de administrador." });
        }

        // Validate pagination parameters
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 200);

        // Single optimized query with server-side joins and projection
        var query = from u in _context.Usuarios
                    let l = _context.UsuariosLegacy.FirstOrDefault(x => x.Email == u.CorreoElectronico)
                    let a = _context.Accesos.FirstOrDefault(x => x.IdUsuario == l.IdUsuario)
                    let pf = _context.Perfiles.FirstOrDefault(x => x.IdPerfil == a.IdPerfil)
                    let p = _context.PagosLegacy.OrderByDescending(x => x.FechaPago).FirstOrDefault(x => x.IdUsuario == l.IdUsuario)
                    let pl = _context.PlanesSuscripcion.FirstOrDefault(x => x.Idsuscripcion == p.Idsuscripcion)
                    where u.Activo
                    select new AdminUserSettingsDto(
                        u.Id,
                        u.Nombre,
                        u.Apellido,
                        u.CorreoElectronico,
                        u.Rol == UserRole.Administrator ? "admin" : u.Rol == UserRole.Professional ? "dev" : "validator",
                        u.Telefono,
                        u.Cedula,
                        pf != null ? pf.IdPerfil : null,
                        pf != null ? pf.NombrePerfil : string.Empty,
                        pl != null ? pl.Idsuscripcion : null,
                        pl != null ? pl.NombrePlan : string.Empty,
                        pl != null ? pl.Precio : null
                    );

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        var response = new PaginatedResponse<AdminUserSettingsDto>(items, totalCount, page, pageSize);
        return Ok(response);
    }

    [HttpPost("users")]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserDto request, CancellationToken cancellationToken)
    {
        if (!await IsAdminAsync()) return StatusCode(StatusCodes.Status403Forbidden, new { Message = "Acceso denegado." });

        if (await _context.Usuarios.AnyAsync(u => u.CorreoElectronico == request.Email, cancellationToken))
            return BadRequest(new { Message = "El correo electrÃ³nico ya estÃ¡ en uso." });

        UserRole role = request.Role.ToLower() switch
        {
            "admin" => UserRole.Administrator,
            "dev" => UserRole.Professional,
            "validator" => UserRole.Consultation,
            _ => UserRole.Consultation
        };

        string nombre = string.IsNullOrWhiteSpace(request.Nombre) ? "Usuario" : request.Nombre;
        string apellido = string.IsNullOrWhiteSpace(request.Apellido) ? "Nuevo" : request.Apellido;

        string finalPassword = string.IsNullOrWhiteSpace(request.Password) ? "Temporal123!" : request.Password;
        string hashedPassword = _passwordHasher.HashPassword(finalPassword);

        var user = new Usuario(
            nombre: nombre,
            apellido: apellido,
            correoElectronico: request.Email,
            contrasenaHash: hashedPassword,
            rol: role,
            telefono: string.IsNullOrWhiteSpace(request.Telefono) ? "0000000000" : request.Telefono,
            cedula: string.IsNullOrWhiteSpace(request.Cedula) ? "00000000000" : request.Cedula
        );

        _context.Usuarios.Add(user);

        // Save the new user first so that its ID exists in the database.
        // This prevents foreign key conflicts when inserting Acceso and Pagos
        // which depend on the user's ID.
        await _context.SaveChangesAsync(cancellationToken);

        if (!string.IsNullOrWhiteSpace(request.Password))
        {
            var notification = new Notificacion(
                usuarioId: user.Id,
                mensaje: "Tu cuenta fue creada con una contraseña temporal. Por favor, cámbiala en tu perfil.",
                tipo: "Warning",
                enlaceRelacionado: "/profile"
            );
            _context.Notificaciones.Add(notification);
        }

        // Sync legacy (inserts Acceso and Pagos)
        await SyncUserLegacyAsync(user, cancellationToken);

        // Second SaveChangesAsync for notifications and legacy tables
        await _context.SaveChangesAsync(cancellationToken);

        return Ok(new { Message = "Usuario creado exitosamente.", Id = user.Id });
    }

    [HttpPut("users/{id}")]
    public async Task<IActionResult> UpdateUser(Guid id, [FromBody] UpdateUserDto request, CancellationToken cancellationToken)
    {
        if (!await IsAdminAsync()) return StatusCode(StatusCodes.Status403Forbidden, new { Message = "Acceso denegado." });

        var user = await _context.Usuarios.FirstOrDefaultAsync(u => u.Id == id, cancellationToken);
        if (user == null) return NotFound(new { Message = "Usuario no encontrado." });

        // Use centralized role/profile mapping
        var (targetRole, targetProfileName) = RoleProfileMapper.MapRole(request.Role);
        if (targetRole == null)
        {
            return BadRequest(new { Message = "Rol no vÃ¡lido. Debe ser admin, dev, o validator." });
        }

        user.UpdateRol(targetRole.Value);

        if (!string.IsNullOrWhiteSpace(request.Nombre) || !string.IsNullOrWhiteSpace(request.Apellido))
        {
            var nombre = string.IsNullOrWhiteSpace(request.Nombre) ? user.Nombre : request.Nombre;
            var apellido = string.IsNullOrWhiteSpace(request.Apellido) ? user.Apellido : request.Apellido;
            user.UpdateProfile(nombre, apellido, request.Telefono ?? user.Telefono ?? "0000000000");
        }
        else if (!string.IsNullOrWhiteSpace(request.Telefono) && !string.IsNullOrWhiteSpace(request.Cedula))
        {
            user.UpdateContactInfo(request.Telefono, request.Cedula);
        }

        // Sync legacy record (creates if missing) in same transaction
        await SyncUserLegacyAsync(user, cancellationToken);

        // Update legacy profile to match new role
        var perf = await _context.Perfiles.FirstOrDefaultAsync(p => p.NombrePerfil == targetProfileName, cancellationToken);
        if (perf != null)
        {
            var acceso = await _context.Accesos.FirstOrDefaultAsync(a => a.IdUsuario == user.Id, cancellationToken);
            if (acceso == null)
            {
                acceso = new Acceso { IdUsuario = user.Id, IdPerfil = perf.IdPerfil };
                _context.Accesos.Add(acceso);
            }
            else
            {
                acceso.IdPerfil = perf.IdPerfil;
            }
        }

        // Single SaveChangesAsync for entire operation
        await _context.SaveChangesAsync(cancellationToken);

        return Ok(new { Message = "Usuario actualizado exitosamente." });
    }

    [HttpDelete("users/{id}")]
    public async Task<IActionResult> DeleteUser(Guid id, CancellationToken cancellationToken)
    {
        if (!await IsAdminAsync()) return StatusCode(StatusCodes.Status403Forbidden, new { Message = "Acceso denegado." });

        var user = await _context.Usuarios.FirstOrDefaultAsync(u => u.Id == id, cancellationToken);
        if (user == null) return NotFound(new { Message = "Usuario no encontrado." });

        var auditorias = await _context.Auditorias.Where(a => a.UsuarioId == id).ToListAsync(cancellationToken);
        if (auditorias.Any()) _context.Auditorias.RemoveRange(auditorias);

        var notificaciones = await _context.Notificaciones.Where(n => n.UsuarioId == id).ToListAsync(cancellationToken);
        if (notificaciones.Any()) _context.Notificaciones.RemoveRange(notificaciones);

        var proyectos = await _context.Proyectos.Where(p => p.UsuarioCreadorId == id).ToListAsync(cancellationToken);
        if (proyectos.Any()) return BadRequest(new { Message = "El usuario tiene proyectos asociados y no puede ser eliminado." });

        var reportes = await _context.Reportes.Where(r => r.GeneradoPorUsuarioId == id).ToListAsync(cancellationToken);
        if (reportes.Any()) return BadRequest(new { Message = "El usuario tiene reportes asociados y no puede ser eliminado." });

        var consentimientos = await _context.ConsentimientosFinancieros.Where(c => c.UsuarioId == id).ToListAsync(cancellationToken);
        if (consentimientos.Any()) _context.ConsentimientosFinancieros.RemoveRange(consentimientos);

        _context.Usuarios.Remove(user);
        
        // Remove legacy dependencies
        var access = await _context.Accesos.Where(a => a.IdUsuario == user.Id).ToListAsync(cancellationToken);
        _context.Accesos.RemoveRange(access);
        
        var pagos = await _context.PagosLegacy.Where(p => p.IdUsuario == user.Id).ToListAsync(cancellationToken);
        _context.PagosLegacy.RemoveRange(pagos);
        
        // Do not remove from UsuariosLegacy since it is a view over Usuarios

        await _context.SaveChangesAsync(cancellationToken);

        return Ok(new { Message = "Usuario eliminado exitosamente." });
    }

    [HttpPatch("users/{id}/role")]
    public async Task<IActionResult> UpdateUserRole(Guid id, [FromBody] UpdateRoleRequest request, CancellationToken cancellationToken)
    {
        if (!await IsAdminAsync())
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { Message = "Acceso denegado. Se requieren permisos de administrador." });
        }

        if (request == null || string.IsNullOrWhiteSpace(request.Role))
        {
            return BadRequest(new { Message = "El rol es requerido." });
        }

        var u = await _context.Usuarios.FirstOrDefaultAsync(user => user.Id == id, cancellationToken);
        if (u == null)
        {
            return NotFound(new { Message = "Usuario no encontrado." });
        }

        // Use centralized role/profile mapping
        var (targetRole, targetProfileName) = RoleProfileMapper.MapRole(request.Role);
        if (targetRole == null)
        {
            return BadRequest(new { Message = "Rol no vÃ¡lido. Debe ser admin, dev, o validator." });
        }

        // Update EF user role
        u.UpdateRol(targetRole.Value);

        // Update or sync legacy record
        var lu = await _context.UsuariosLegacy.FirstOrDefaultAsync(l => l.Email == u.Email, cancellationToken);
        if (lu == null)
        {
            await SyncUserLegacyAsync(u, cancellationToken);
            lu = await _context.UsuariosLegacy.FirstOrDefaultAsync(l => l.Email == u.Email, cancellationToken);
        }

        if (lu != null)
        {
            var perf = await _context.Perfiles.FirstOrDefaultAsync(p => p.NombrePerfil == targetProfileName, cancellationToken);
            if (perf != null)
            {
                var acceso = await _context.Accesos.FirstOrDefaultAsync(a => a.IdUsuario == lu.IdUsuario, cancellationToken);
                if (acceso == null)
                {
                    acceso = new Acceso { IdUsuario = lu.IdUsuario, IdPerfil = perf.IdPerfil };
                    _context.Accesos.Add(acceso);
                }
                else
                {
                    acceso.IdPerfil = perf.IdPerfil;
                }
            }
        }

        await _context.SaveChangesAsync(cancellationToken);

        return Ok(new { Message = "Rol y perfil actualizados exitosamente." });
    }

    [HttpPatch("users/{id}/plan")]
    public async Task<IActionResult> UpdateUserPlan(Guid id, [FromBody] UpdatePlanRequest request, CancellationToken cancellationToken)
    {
        if (!await IsAdminAsync())
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { Message = "Acceso denegado. Se requieren permisos de administrador." });
        }

        if (request == null || request.PlanId == Guid.Empty)
        {
            return BadRequest(new { Message = "ID de plan invÃ¡lido." });
        }

        var u = await _context.Usuarios.FirstOrDefaultAsync(user => user.Id == id, cancellationToken);
        if (u == null)
        {
            return NotFound(new { Message = "Usuario no encontrado." });
        }

        var plan = await _context.PlanesSuscripcion.FirstOrDefaultAsync(p => p.Idsuscripcion == request.PlanId, cancellationToken);
        if (plan == null)
        {
            return BadRequest(new { Message = "El plan de suscripciÃ³n seleccionado no existe." });
        }

        // Sync legacy user if missing
        await SyncUserLegacyAsync(u, cancellationToken);

        // Insert a new payment/allocation record in Pagos table
        var nuevoPago = new Pago
        {
            IdUsuario = u.Id,
            Idsuscripcion = plan.Idsuscripcion,
            Monto = plan.Precio,
            FechaPago = DateTime.UtcNow
        };
        _context.PagosLegacy.Add(nuevoPago);

        // Single SaveChangesAsync for entire operation
        await _context.SaveChangesAsync(cancellationToken);

        return Ok(new { Message = "SuscripciÃ³n asignada y pago registrado exitosamente." });
    }

    [HttpGet("profiles")]
    public async Task<IActionResult> GetProfiles(CancellationToken cancellationToken)
    {
        if (!await IsAdminAsync())
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { Message = "Acceso denegado. Se requieren permisos de administrador." });
        }

        var perfiles = await _context.Perfiles.ToListAsync(cancellationToken);
        var perfilPermisos = await _context.PerfilPermisos.Include(pp => pp.Permiso).ToListAsync(cancellationToken);

        var result = perfiles.Select(perfil => new
        {
            PerfilId = perfil.IdPerfil,
            Name = perfil.NombrePerfil,
            Permissions = perfilPermisos
                .Where(pp => pp.IdPerfil == perfil.IdPerfil && pp.Permiso != null)
                .Select(pp => pp.Permiso!.Descripcion)
                .ToList()
        });

        return Ok(result);
    }

    [HttpGet("plans")]
    public async Task<IActionResult> GetPlans(CancellationToken cancellationToken)
    {
        if (!await IsAdminAsync())
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { Message = "Acceso denegado. Se requieren permisos de administrador." });
        }

        var planes = await _context.PlanesSuscripcion.ToListAsync(cancellationToken);
        var result = planes.Select(p => new
        {
            PlanId = p.Idsuscripcion,
            Name = p.NombrePlan,
            Price = p.Precio
        });

        return Ok(result);
    }

    private Task<bool> IsAdminAsync()
    {
        if (User?.Identity?.IsAuthenticated != true)
        {
            return Task.FromResult(false);
        }

        var roleClaim = User.FindFirstValue(System.Security.Claims.ClaimTypes.Role) ?? User.FindFirstValue("role");
        return Task.FromResult(roleClaim == "admin");
    }

    private async Task SyncUserLegacyAsync(Usuario u, CancellationToken cancellationToken = default)
    {
        // Don't add to UsuariosLegacy explicitly because it is a VIEW over Usuarios
        // The record will appear in the view automatically once SaveChanges is called.

        // Ensure profiles are loaded (cached for performance)
        var adminLegacyProfile = await _context.Perfiles.FirstOrDefaultAsync(p => p.NombrePerfil == "ADMIN", cancellationToken);
        var devLegacyProfile = await _context.Perfiles.FirstOrDefaultAsync(p => p.NombrePerfil == "DEVELOPER", cancellationToken);
        var valLegacyProfile = await _context.Perfiles.FirstOrDefaultAsync(p => p.NombrePerfil == "VALIDATOR", cancellationToken);

        var hasAcceso = await _context.Accesos.AnyAsync(a => a.IdUsuario == u.Id, cancellationToken);
        if (!hasAcceso)
        {
            var targetPerfil = u.Rol switch
            {
                UserRole.Administrator => adminLegacyProfile,
                UserRole.Professional => devLegacyProfile,
                UserRole.Consultation => valLegacyProfile,
                _ => devLegacyProfile
            };

            if (targetPerfil != null)
            {
                _context.Accesos.Add(new Acceso { IdUsuario = u.Id, IdPerfil = targetPerfil.IdPerfil });
            }
        }

        var hasPagos = await _context.PagosLegacy.AnyAsync(p => p.IdUsuario == u.Id, cancellationToken);
        if (!hasPagos)
        {
            var freePlan = await _context.PlanesSuscripcion.FirstOrDefaultAsync(p => p.NombrePlan == "Gratuito", cancellationToken);
            var proPlan = await _context.PlanesSuscripcion.FirstOrDefaultAsync(p => p.NombrePlan == "Profesional", cancellationToken);
            
            var targetPlan = u.Rol == UserRole.Administrator ? proPlan : freePlan;
            if (targetPlan != null)
            {
                _context.PagosLegacy.Add(new Pago
                {
                    IdUsuario = u.Id,
                    Idsuscripcion = targetPlan.Idsuscripcion,
                    Monto = targetPlan.Precio,
                    FechaPago = DateTime.UtcNow
                });
            }
        }
        
        // Single SaveChangesAsync at the end - caller is responsible for calling it
    }
}

public class UpdateRoleRequest
{
    public string Role { get; set; } = string.Empty;
}

public class UpdatePlanRequest
{
    public Guid PlanId { get; set; }
}

public class CreateUserDto
{
    public string Nombre { get; set; } = string.Empty;
    public string Apellido { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = "user";
    public string Telefono { get; set; } = "0000000000";
    public string Cedula { get; set; } = "00000000000";
    public string? Password { get; set; }
}

public class UpdateUserDto
{
    public string? Nombre { get; set; }
    public string? Apellido { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = "user";
    public string? Telefono { get; set; }
    public string? Cedula { get; set; }
}

/// <summary>
/// Centralized mapping between API role strings and domain enums/profile names
/// </summary>
public static class RoleProfileMapper
{
    private static readonly Dictionary<string, (UserRole Role, string ProfileName)> RoleMap = new(StringComparer.OrdinalIgnoreCase)
    {
        ["admin"] = (UserRole.Administrator, "ADMIN"),
        ["dev"] = (UserRole.Professional, "DEVELOPER"),
        ["validator"] = (UserRole.Consultation, "VALIDATOR"),
        ["user"] = (UserRole.Consultation, "VALIDATOR") // Default fallback
    };

    public static (UserRole? Role, string ProfileName) MapRole(string roleString)
    {
        if (string.IsNullOrWhiteSpace(roleString))
            return (null, string.Empty);

        if (RoleMap.TryGetValue(roleString.Trim().ToLower(), out var mapping))
        {
            return (mapping.Role, mapping.ProfileName);
        }

        return (null, string.Empty);
    }

    public static string MapRoleToProfileName(UserRole role)
    {
        return role switch
        {
            UserRole.Administrator => "ADMIN",
            UserRole.Professional => "DEVELOPER",
            UserRole.Consultation => "VALIDATOR",
            _ => "VALIDATOR"
        };
    }

    public static UserRole MapProfileNameToRole(string profileName)
    {
        return profileName.ToUpperInvariant() switch
        {
            "ADMIN" => UserRole.Administrator,
            "DEVELOPER" => UserRole.Professional,
            "VALIDATOR" => UserRole.Consultation,
            _ => UserRole.Consultation
        };
    }
}

