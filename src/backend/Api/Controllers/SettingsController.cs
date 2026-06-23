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
    public async Task<IActionResult> GetUsers(CancellationToken cancellationToken)
    {
        if (!await IsAdminAsync())
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { Message = "Acceso denegado. Se requieren permisos de administrador." });
        }

        var efUsers = await _context.Usuarios.ToListAsync(cancellationToken);

        // Auto sync if any user doesn't have a legacy record
        foreach (var u in efUsers)
        {
            var legacyUser = await _context.UsuariosLegacy.FirstOrDefaultAsync(ul => ul.Email == u.Email, cancellationToken);
            var hasAcceso = legacyUser != null && await _context.Accesos.AnyAsync(a => a.IdUsuario == legacyUser.IdUsuario, cancellationToken);
            var hasPago = legacyUser != null && await _context.PagosLegacy.AnyAsync(p => p.IdUsuario == legacyUser.IdUsuario, cancellationToken);

            if (legacyUser == null || !hasAcceso || !hasPago)
            {
                await SyncUserLegacyAsync(u);
            }
        }

        // Fetch everything again
        var legacyUsers = await _context.UsuariosLegacy.ToListAsync(cancellationToken);
        var accesos = await _context.Accesos.ToListAsync(cancellationToken);
        var perfiles = await _context.Perfiles.ToListAsync(cancellationToken);
        
        // Order by descending date to get the latest plan
        var pagos = await _context.PagosLegacy
            .OrderByDescending(p => p.FechaPago)
            .ToListAsync(cancellationToken);
        var planes = await _context.PlanesSuscripcion.ToListAsync(cancellationToken);

        var resultList = new List<object>();

        foreach (var u in efUsers)
        {
            var lu = legacyUsers.FirstOrDefault(l => string.Equals(l.Email, u.Email, StringComparison.OrdinalIgnoreCase));
            
            Guid? profileId = null;
            string profileName = string.Empty;
            Guid? planId = null;
            string planName = string.Empty;
            decimal? planPrice = null;

            if (lu != null)
            {
                var acceso = accesos.FirstOrDefault(a => a.IdUsuario == lu.IdUsuario);
                if (acceso != null)
                {
                    var perf = perfiles.FirstOrDefault(p => p.IdPerfil == acceso.IdPerfil);
                    if (perf != null)
                    {
                        profileId = perf.IdPerfil;
                        profileName = perf.NombrePerfil;
                    }
                }

                var pago = pagos.FirstOrDefault(p => p.IdUsuario == lu.IdUsuario);
                if (pago != null)
                {
                    var plan = planes.FirstOrDefault(p => p.Idsuscripcion == pago.Idsuscripcion);
                    if (plan != null)
                    {
                        planId = plan.Idsuscripcion;
                        planName = plan.NombrePlan;
                        planPrice = plan.Precio;
                    }
                }
            }

            string roleStr = u.Rol switch
            {
                UserRole.Administrator => "admin",
                UserRole.Professional => "dev",
                UserRole.Consultation => "validator",
                _ => "user"
            };

            resultList.Add(new
            {
                Id = u.Id,
                Name = u.NombreCompleto,
                Email = u.CorreoElectronico,
                Role = roleStr,
                Telefono = u.Telefono,
                Cedula = u.Cedula,
                ProfileId = profileId,
                ProfileName = profileName,
                PlanId = planId,
                PlanName = planName,
                PlanPrice = planPrice
            });
        }

        return Ok(resultList);
    }

    [HttpPost("users")]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserDto request, CancellationToken cancellationToken)
    {
        if (!await IsAdminAsync()) return StatusCode(StatusCodes.Status403Forbidden, new { Message = "Acceso denegado." });

        if (await _context.Usuarios.AnyAsync(u => u.CorreoElectronico == request.Email, cancellationToken))
            return BadRequest(new { Message = "El correo electrónico ya está en uso." });

        UserRole role = request.Role.ToLower() switch
        {
            "admin" => UserRole.Administrator,
            "dev" => UserRole.Professional,
            "validator" => UserRole.Consultation,
            _ => UserRole.Consultation
        };

        var nameParts = request.Name.Split(' ', 2);
        string nombre = nameParts[0];
        string apellido = nameParts.Length > 1 ? nameParts[1] : string.Empty;

        string finalPassword = string.IsNullOrWhiteSpace(request.Password) ? "Temporal123!" : request.Password;
        string hashedPassword = _passwordHasher.HashPassword(finalPassword);

        var user = new Usuario(
            nombre: string.IsNullOrWhiteSpace(nombre) ? "Usuario" : nombre,
            apellido: string.IsNullOrWhiteSpace(apellido) ? "Nuevo" : apellido,
            correoElectronico: request.Email,
            contrasenaHash: hashedPassword,
            rol: role,
            telefono: string.IsNullOrWhiteSpace(request.Telefono) ? "0000000000" : request.Telefono,
            cedula: string.IsNullOrWhiteSpace(request.Cedula) ? "00000000000" : request.Cedula
        );

        _context.Usuarios.Add(user);

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

        await _context.SaveChangesAsync(cancellationToken);

        await SyncUserLegacyAsync(user);

        return Ok(new { Message = "Usuario creado exitosamente.", Id = user.Id });
    }

    [HttpPut("users/{id}")]
    public async Task<IActionResult> UpdateUser(Guid id, [FromBody] UpdateUserDto request, CancellationToken cancellationToken)
    {
        if (!await IsAdminAsync()) return StatusCode(StatusCodes.Status403Forbidden, new { Message = "Acceso denegado." });

        var user = await _context.Usuarios.FirstOrDefaultAsync(u => u.Id == id, cancellationToken);
        if (user == null) return NotFound(new { Message = "Usuario no encontrado." });

        UserRole role = request.Role.ToLower() switch
        {
            "admin" => UserRole.Administrator,
            "dev" => UserRole.Professional,
            "validator" => UserRole.Consultation,
            _ => UserRole.Consultation
        };

        user.UpdateRol(role);
        
        if (!string.IsNullOrWhiteSpace(request.Telefono) && !string.IsNullOrWhiteSpace(request.Cedula))
        {
            user.UpdateContactInfo(request.Telefono, request.Cedula);
        }

        await _context.SaveChangesAsync(cancellationToken);
        
        // Also update role in legacy
        var roleReq = new UpdateRoleRequest { Role = request.Role };
        await UpdateUserRole(id, roleReq, cancellationToken);

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

        _context.Usuarios.Remove(user);
        
        // Remove legacy
        var legacyUser = await _context.UsuariosLegacy.FirstOrDefaultAsync(l => l.Email == user.CorreoElectronico, cancellationToken);
        if (legacyUser != null)
        {
            var access = await _context.Accesos.Where(a => a.IdUsuario == legacyUser.IdUsuario).ToListAsync(cancellationToken);
            _context.Accesos.RemoveRange(access);
            
            var pagos = await _context.PagosLegacy.Where(p => p.IdUsuario == legacyUser.IdUsuario).ToListAsync(cancellationToken);
            _context.PagosLegacy.RemoveRange(pagos);
            
            _context.UsuariosLegacy.Remove(legacyUser);
        }

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

        UserRole targetRole;
        string targetProfileName;

        switch (request.Role.ToLower())
        {
            case "admin":
                targetRole = UserRole.Administrator;
                targetProfileName = "ADMIN";
                break;
            case "dev":
                targetRole = UserRole.Professional;
                targetProfileName = "DEVELOPER";
                break;
            case "validator":
                targetRole = UserRole.Consultation;
                targetProfileName = "VALIDATOR";
                break;
            default:
                return BadRequest(new { Message = "Rol no válido. Debe ser admin, dev, o validator." });
        }

        // Update EF user role
        u.UpdateRol(targetRole);

        // Update or sync legacy record
        var lu = await _context.UsuariosLegacy.FirstOrDefaultAsync(l => l.Email == u.Email, cancellationToken);
        if (lu == null)
        {
            await SyncUserLegacyAsync(u);
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
            return BadRequest(new { Message = "ID de plan inválido." });
        }

        var u = await _context.Usuarios.FirstOrDefaultAsync(user => user.Id == id, cancellationToken);
        if (u == null)
        {
            return NotFound(new { Message = "Usuario no encontrado." });
        }

        var plan = await _context.PlanesSuscripcion.FirstOrDefaultAsync(p => p.Idsuscripcion == request.PlanId, cancellationToken);
        if (plan == null)
        {
            return BadRequest(new { Message = "El plan de suscripción seleccionado no existe." });
        }

        // Sync legacy user if missing
        var lu = await _context.UsuariosLegacy.FirstOrDefaultAsync(l => l.Email == u.Email, cancellationToken);
        if (lu == null)
        {
            await SyncUserLegacyAsync(u);
            lu = await _context.UsuariosLegacy.FirstOrDefaultAsync(l => l.Email == u.Email, cancellationToken);
        }

        if (lu != null)
        {
            // Insert a new payment/allocation record in Pagos table
            var nuevoPago = new Pago
            {
                IdUsuario = lu.IdUsuario,
                Idsuscripcion = plan.Idsuscripcion,
                Monto = plan.Precio,
                FechaPago = DateTime.UtcNow
            };
            _context.PagosLegacy.Add(nuevoPago);
            await _context.SaveChangesAsync(cancellationToken);
        }

        return Ok(new { Message = "Suscripción asignada y pago registrado exitosamente." });
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

    private async Task SyncUserLegacyAsync(Usuario u)
    {
        var existingLegacy = await _context.UsuariosLegacy.FirstOrDefaultAsync(ul => ul.Email == u.Email);
        if (existingLegacy == null)
        {
            existingLegacy = new UsuarioLegacy
            {
                Nombre = u.Nombre,
                Apellido = u.Apellido,
                NombreCompleto = u.NombreCompleto,
                Email = u.Email,
                ContrasenaHash = u.ContrasenaHash,
                Telefono = u.Telefono,
                Cedula = u.Cedula
            };
            _context.UsuariosLegacy.Add(existingLegacy);
            await _context.SaveChangesAsync();
        }

        var hasAcceso = await _context.Accesos.AnyAsync(a => a.IdUsuario == existingLegacy.IdUsuario);
        if (!hasAcceso)
        {
            var adminLegacyProfile = await _context.Perfiles.FirstOrDefaultAsync(p => p.NombrePerfil == "ADMIN");
            var devLegacyProfile = await _context.Perfiles.FirstOrDefaultAsync(p => p.NombrePerfil == "DEVELOPER");
            var valLegacyProfile = await _context.Perfiles.FirstOrDefaultAsync(p => p.NombrePerfil == "VALIDATOR");

            var targetPerfil = u.Rol switch
            {
                UserRole.Administrator => adminLegacyProfile,
                UserRole.Professional => devLegacyProfile,
                UserRole.Consultation => valLegacyProfile,
                _ => devLegacyProfile
            };

            if (targetPerfil != null)
            {
                _context.Accesos.Add(new Acceso { IdUsuario = existingLegacy.IdUsuario, IdPerfil = targetPerfil.IdPerfil });
            }
        }

        var hasPagos = await _context.PagosLegacy.AnyAsync(p => p.IdUsuario == existingLegacy.IdUsuario);
        if (!hasPagos)
        {
            var freePlan = await _context.PlanesSuscripcion.FirstOrDefaultAsync(p => p.NombrePlan == "Gratuito");
            var proPlan = await _context.PlanesSuscripcion.FirstOrDefaultAsync(p => p.NombrePlan == "Profesional");
            
            var targetPlan = u.Rol == UserRole.Administrator ? proPlan : freePlan;
            if (targetPlan != null)
            {
                _context.PagosLegacy.Add(new Pago
                {
                    IdUsuario = existingLegacy.IdUsuario,
                    Idsuscripcion = targetPlan.Idsuscripcion,
                    Monto = targetPlan.Precio,
                    FechaPago = DateTime.UtcNow
                });
            }
        }

        await _context.SaveChangesAsync();
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
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = "user";
    public string Telefono { get; set; } = "0000000000";
    public string Cedula { get; set; } = "00000000000";
    public string? Password { get; set; }
}

public class UpdateUserDto
{
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = "user";
    public string? Telefono { get; set; }
    public string? Cedula { get; set; }
}
