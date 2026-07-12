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
public record BasicUserDto(Guid Id, string Nombre, string Apellido, string Email);

public record AdminUserSettingsDto(
    Guid Id,
    string Nombre,
    string Apellido,
    string Email,
    string Role,
    string Telefono,
    string Cedula,
    string? Rnc,
    string? RazonSocial,
    string? NombreComercial,
    Guid? ProfileId,
    string ProfileName,
    Guid? PlanId,
    string PlanName,
    decimal? PlanPrice,
    DateTime? PlanCreatedAt,
    DateTime? PlanExpiresAt,
    int UsedProjects,
    int UsedQueries,
    int MaxInvitees,
    int InviteesCount,
    IEnumerable<BasicUserDto> InviteesList,
    Guid? TitularId
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
    private readonly Application.Abstractions.Notifications.IEmailService _emailService;

    public SettingsController(
        AppDbContext context, 
        Application.Abstractions.Security.IPasswordHasher passwordHasher,
        Application.Abstractions.Notifications.IEmailService emailService)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _emailService = emailService;
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
        // pageSize = Math.Clamp(pageSize, 1, 200); // Removed to allow loading all users

        var query = from u in _context.Usuarios
                    let dgii = _context.DGII.FirstOrDefault(x => x.Rnc == u.Rnc)
                    let inviteesCount = _context.Usuarios.Count(x => x.TitularId == u.Id)
                    where u.Activo && u.AccountStatus == Domain.Enums.UserAccountStatus.Active && u.Rol != Domain.Enums.UserRole.Administrator && (u.Plan == null || u.Plan.NombrePlan != "Consultor")
                    select new {
                        u.Id,
                        u.Nombre,
                        u.Apellido,
                        Email = u.CorreoElectronico,
                        Role = u.Rol == Domain.Enums.UserRole.Administrator ? "admin" : "user",
                        u.Telefono,
                        u.Cedula,
                        u.Rnc,
                        RazonSocial = dgii != null ? dgii.NombreRazonSocial : null,
                        NombreComercial = dgii != null ? dgii.NombreComercial : null,
                        PlanId = u.PlanSuscripcionId,
                        PlanName = u.TitularId != null ? "Invitado" : (u.Plan != null ? u.Plan.NombrePlan : "Gratuito"),
                        PlanPrice = u.TitularId != null ? 0m : (u.Plan != null ? u.Plan.Precio : 0m),
                        PlanCreatedAt = u.CreatedAtUtc,
                        PlanExpiresAt = u.CurrentPeriodEnd,
                        UsedProjects = u.ProyectosCreados,
                        UsedQueries = u.ConsultasUsadas,
                        MaxInvitees = u.TitularId != null ? 0 : (u.Plan != null && u.Plan.NombrePlan == "Corporativo" ? 10 : (u.Plan != null && u.Plan.NombrePlan == "Empresa" ? 5 : 0)),
                        InviteesCount = inviteesCount
                    };

        var totalCount = await query.CountAsync(cancellationToken);
        var rawItems = await query.ToListAsync(cancellationToken);

        var itemIds = rawItems.Select(x => x.Id).ToList();
        var allInvitees = await _context.Usuarios
            .Where(x => x.TitularId != null && itemIds.Contains(x.TitularId.Value))
            .Select(x => new { x.TitularId, User = new BasicUserDto(x.Id, x.Nombre, x.Apellido, x.CorreoElectronico) })
            .ToListAsync(cancellationToken);

        var items = rawItems.Select(r => new AdminUserSettingsDto(
            r.Id,
            r.Nombre,
            r.Apellido,
            r.Email,
            r.Role,
            r.Telefono,
            r.Cedula,
            r.Rnc,
            r.RazonSocial,
            r.NombreComercial,
            null,
            string.Empty,
            r.PlanId,
            r.PlanName,
            r.PlanPrice,
            r.PlanCreatedAt,
            r.PlanExpiresAt,
            r.UsedProjects,
            r.UsedQueries,
            r.MaxInvitees,
            r.InviteesCount,
            allInvitees.Where(i => i.TitularId == r.Id).Select(i => i.User).ToList(),
            allInvitees.Any(i => i.User.Id == r.Id) ? allInvitees.First(i => i.User.Id == r.Id).TitularId : null
        )).ToList();

        var response = new PaginatedResponse<AdminUserSettingsDto>(items, totalCount, page, pageSize);
        return Ok(response);
    }

    [HttpPost("users")]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserDto request, CancellationToken cancellationToken)
    {
        if (!await IsAdminAsync()) return StatusCode(StatusCodes.Status403Forbidden, new { Message = "Acceso denegado." });

        if (string.IsNullOrWhiteSpace(request.Email))
            return BadRequest(new { Message = "El correo electrónico es obligatorio." });
        if (string.IsNullOrWhiteSpace(request.Telefono))
            return BadRequest(new { Message = "El teléfono es obligatorio." });
        if (string.IsNullOrWhiteSpace(request.Cedula))
            return BadRequest(new { Message = "La cédula es obligatoria." });

        if (request.Nombre != null && request.Nombre.Any(char.IsDigit))
            return BadRequest(new { Message = "El nombre no puede contener números." });
        if (request.Apellido != null && request.Apellido.Any(char.IsDigit))
            return BadRequest(new { Message = "El apellido no puede contener números." });

        if (await _context.Usuarios.AnyAsync(u => u.CorreoElectronico == request.Email, cancellationToken))
            return BadRequest(new { Message = "El correo electrónico ya está en uso." });

        if (!string.IsNullOrWhiteSpace(request.Password))
        {
            var p = request.Password;
            if (p.Length < 8 || !p.Any(char.IsUpper) || !p.Any(char.IsLower) || !p.Any(char.IsDigit) || !p.Any(ch => "!@#$%^&*-".Contains(ch)))
            {
                return BadRequest(new { Message = "La contraseña debe tener mínimo 8 caracteres, mayúscula, minúscula, número y carácter especial." });
            }
        }

        UserRole role = request.Role.ToLower() switch
        {
            "admin" => UserRole.Administrator,
            "user" => UserRole.User,
            _ => UserRole.User
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

        user.ForzarVerificacionEmail();

        if (!string.IsNullOrWhiteSpace(request.PlanNombre))
        {
            var plan = await _context.PlanesSuscripcion.FirstOrDefaultAsync(p => p.NombrePlan == request.PlanNombre, cancellationToken);
            if (plan != null)
            {
                user.AsignarPlan(plan.Id);
            }
        }

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

        try
        {
            var html = Infrastructure.Email.EmailTemplates.GetAccountCreatedByAdminEmail(nombre, request.Email, finalPassword);
            await _emailService.SendEmailAsync(request.Email, "Cuenta Creada — VeriFinca", html);
        }
        catch (Exception)
        {
            // If email sending fails, we don't fail the user creation
        }

        return Ok(new { Message = "Usuario creado exitosamente.", Id = user.Id });
    }

    [HttpPut("users/{id}")]
    public async Task<IActionResult> UpdateUser(Guid id, [FromBody] UpdateUserDto request, CancellationToken cancellationToken)
    {
        if (!await IsAdminAsync()) return StatusCode(StatusCodes.Status403Forbidden, new { Message = "Acceso denegado." });

        var user = await _context.Usuarios.FirstOrDefaultAsync(u => u.Id == id, cancellationToken);
        if (user == null) return NotFound(new { Message = "Usuario no encontrado." });

        if (request.Nombre != null && request.Nombre.Any(char.IsDigit))
            return BadRequest(new { Message = "El nombre no puede contener números." });
        if (request.Apellido != null && request.Apellido.Any(char.IsDigit))
            return BadRequest(new { Message = "El apellido no puede contener números." });

        var (targetRole, targetProfileName) = RoleProfileMapper.MapRole(request.Role);
        if (targetRole == null)
        {
            return BadRequest(new { Message = "Rol no vÃ¡lido. Debe ser admin o user." });
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

        // Update Rnc if provided
        if (request.Rnc != null)
        {
            user.UpdateRnc(request.Rnc);
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

        try {
            var auditorias = await _context.Auditorias.Where(a => a.UsuarioId == id).ToListAsync(cancellationToken);
            if (auditorias.Any()) _context.Auditorias.RemoveRange(auditorias);
        } catch {}

        try {
            var notificaciones = await _context.Notificaciones.Where(n => n.UsuarioId == id).ToListAsync(cancellationToken);
            if (notificaciones.Any()) _context.Notificaciones.RemoveRange(notificaciones);
        } catch {}

        try {
            var proyectos = await _context.Proyectos.Where(p => p.UsuarioCreadorId == id).ToListAsync(cancellationToken);
            if (proyectos.Any()) return BadRequest(new { Message = "El usuario tiene proyectos asociados y no puede ser eliminado." });
        } catch {}

        try {
            var reportes = await _context.Reportes.Where(r => r.GeneradoPorUsuarioId == id).ToListAsync(cancellationToken);
            if (reportes.Any()) return BadRequest(new { Message = "El usuario tiene reportes asociados y no puede ser eliminado." });
        } catch {}

        try {
            var consentimientos = await _context.ConsentimientosFinancieros.Where(c => c.UsuarioId == id).ToListAsync(cancellationToken);
            if (consentimientos.Any()) _context.ConsentimientosFinancieros.RemoveRange(consentimientos);
        } catch {}

        try {
            var invitees = await _context.Usuarios.Where(u => u.TitularId == id).ToListAsync(cancellationToken);
            foreach(var invitee in invitees) {
                // Remove reference to avoid FK conflict
                _context.Entry(invitee).Property("TitularId").CurrentValue = null;
            }
        } catch {}

        // Remove legacy dependencies first to avoid FK conflicts
        var access = await _context.Accesos.Where(a => a.IdUsuario == user.Id).ToListAsync(cancellationToken);
        if (access.Any()) _context.Accesos.RemoveRange(access);
        
        var pagos = await _context.PagosLegacy.Where(p => p.IdUsuario == user.Id).ToListAsync(cancellationToken);
        if (pagos.Any()) _context.PagosLegacy.RemoveRange(pagos);

        _context.Usuarios.Remove(user);
        
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

        var (targetRole, targetProfileName) = RoleProfileMapper.MapRole(request.Role);
        if (targetRole == null)
        {
            return BadRequest(new { Message = "Rol no vÃ¡lido. Debe ser admin o user." });
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
            return BadRequest(new { Message = "El plan de suscripción seleccionado no existe." });
        }

        u.AsignarPlan(plan.Idsuscripcion);

        // Enforce team member limit for the new plan
        int maxInvitees = plan.NombrePlan == "Corporativo" ? 10 : (plan.NombrePlan == "Empresa" ? 5 : 0);
        var currentInvitees = await _context.Usuarios
            .Where(usr => usr.TitularId == u.Id)
            .ToListAsync(cancellationToken);

        if (currentInvitees.Count > maxInvitees)
        {
            var excessInvitees = currentInvitees.Skip(maxInvitees).ToList();
            foreach (var invitee in excessInvitees)
            {
                invitee.RemoverTitular();
                invitee.AsignarPlan(Guid.Parse("5F1F3417-402F-4CAC-AE39-F9802A5E72D2"));
            }
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

        return Ok(new { Message = "Suscripción asignada y pago registrado exitosamente." });
    }

    [HttpPost("users/{id}/invitees/{inviteeId}")]
    public async Task<IActionResult> AddInvitee(Guid id, Guid inviteeId, CancellationToken cancellationToken)
    {
        if (!await IsAdminAsync()) return StatusCode(StatusCodes.Status403Forbidden, new { Message = "Acceso denegado." });

        var titular = await _context.Usuarios.Include(user => user.Plan).FirstOrDefaultAsync(user => user.Id == id, cancellationToken);
        if (titular == null) return NotFound(new { Message = "Usuario titular no encontrado." });

        var invitee = await _context.Usuarios.FirstOrDefaultAsync(user => user.Id == inviteeId, cancellationToken);
        if (invitee == null) return NotFound(new { Message = "Usuario a invitar no encontrado." });

        int maxInvitees = titular.Plan != null && titular.Plan.NombrePlan == "Corporativo" ? 10 : (titular.Plan != null && titular.Plan.NombrePlan == "Empresa" ? 5 : 0);
        int currentInvitees = await _context.Usuarios.CountAsync(user => user.TitularId == titular.Id, cancellationToken);

        if (currentInvitees >= maxInvitees)
            return BadRequest(new { Message = "El titular ha alcanzado el límite de usuarios invitados para su plan." });

        invitee.AsignarTitular(titular.Id);
        await _context.SaveChangesAsync(cancellationToken);

        return Ok(new { Message = "Usuario invitado agregado exitosamente." });
    }

    [HttpDelete("users/{id}/invitees/{inviteeId}")]
    public async Task<IActionResult> RemoveInvitee(Guid id, Guid inviteeId, CancellationToken cancellationToken)
    {
        if (!await IsAdminAsync()) return StatusCode(StatusCodes.Status403Forbidden, new { Message = "Acceso denegado." });

        var invitee = await _context.Usuarios.FirstOrDefaultAsync(user => user.Id == inviteeId && user.TitularId == id, cancellationToken);
        if (invitee == null) return NotFound(new { Message = "Usuario invitado no encontrado o no pertenece al titular." });

        invitee.RemoverTitular();
        invitee.AsignarPlan(Guid.Parse("5F1F3417-402F-4CAC-AE39-F9802A5E72D2"));
        await _context.SaveChangesAsync(cancellationToken);

        return Ok(new { Message = "Usuario invitado removido exitosamente." });
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

        var roles = User.Claims
            .Where(c => c.Type == System.Security.Claims.ClaimTypes.Role || c.Type == "role")
            .Select(c => c.Value)
            .ToList();

        return Task.FromResult(roles.Any(r => 
            string.Equals(r, "admin", StringComparison.OrdinalIgnoreCase) || 
            string.Equals(r, "Administrator", StringComparison.OrdinalIgnoreCase)));
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
                UserRole.User => devLegacyProfile,
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
    public string? PlanNombre { get; set; }
}

public class UpdateUserDto
{
    public string? Nombre { get; set; }
    public string? Apellido { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = "user";
    public string? Telefono { get; set; }
    public string? Cedula { get; set; }
    public string? Rnc { get; set; }
}

/// <summary>
/// Centralized mapping between API role strings and domain enums/profile names
/// </summary>
public static class RoleProfileMapper
{
    private static readonly Dictionary<string, (UserRole Role, string ProfileName)> RoleMap = new(StringComparer.OrdinalIgnoreCase)
    {
        ["admin"] = (UserRole.Administrator, "ADMIN"),
        ["user"] = (UserRole.User, "DEVELOPER"), // Default legacy profile for users
        ["dev"] = (UserRole.User, "DEVELOPER"),
        ["validator"] = (UserRole.User, "VALIDATOR")
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
            UserRole.User => "DEVELOPER",
            _ => "DEVELOPER"
        };
    }


}

