using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Persistence;
using Application.DTOs.Admin;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence.Repositories
{
    public class DashboardRepository : IDashboardRepository
    {
        private readonly AppDbContext _context;

        public DashboardRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<DashboardStatsDto> GetAdminDashboardStatsAsync(CancellationToken cancellationToken = default)
        {
            var totalUsuarios = await _context.Set<Usuario>().CountAsync(cancellationToken);
            var suscripcionesActivas = await _context.Set<Usuario>().CountAsync(u => u.PlanSuscripcionId != null, cancellationToken);
            
            // Just an estimation logic (if you add price to Plan it would be a join)
            var ingresosMensualesEstimados = await _context.Set<Usuario>()
                .Include(u => u.Plan)
                .Where(u => u.PlanSuscripcionId != null && u.Plan != null)
                .SumAsync(u => u.Plan!.Precio, cancellationToken);

            var totalProyectos = await _context.Set<Proyecto>().CountAsync(cancellationToken);
            var proyectosPendientes = await _context.Set<Proyecto>().CountAsync(p => p.Status == Domain.Enums.ProjectStatus.Draft, cancellationToken);
            var proyectosAprobados = await _context.Set<Proyecto>().CountAsync(p => p.Status == Domain.Enums.ProjectStatus.Published, cancellationToken);
            var proyectosRechazados = await _context.Set<Proyecto>().CountAsync(p => p.Status == Domain.Enums.ProjectStatus.Rejected, cancellationToken);

            var suscripcionesRecientes = await _context.Set<Usuario>()
                .Include(u => u.Plan)
                .Where(u => u.PlanSuscripcionId != null)
                .OrderByDescending(u => u.UpdatedAtUtc ?? u.CreatedAtUtc)
                .Take(10)
                .Select(u => new SuscripcionRecienteDto
                {
                    FechaAlta = u.UpdatedAtUtc ?? u.CreatedAtUtc,
                    Plan = u.Plan != null ? u.Plan.NombrePlan : "N/A",
                    Correo = u.CorreoElectronico,
                    Estado = u.Activo ? "Activa" : "Inactiva"
                })
                .ToListAsync(cancellationToken);

            var proyectosRecientes = await _context.Set<Proyecto>()
                .Include(p => p.UsuarioCreador)
                .OrderByDescending(p => p.CreatedAtUtc)
                .Take(10)
                .Select(p => new ProyectoRecienteDto
                {
                    FechaRegistro = p.CreatedAtUtc,
                    Nombre = p.Nombre,
                    Desarrollador = p.UsuarioCreador != null ? p.UsuarioCreador.NombreCompleto : "Desconocido",
                    Estado = p.Status.ToString()
                })
                .ToListAsync(cancellationToken);

            var usuariosPorRol = await _context.Set<Usuario>()
                .GroupBy(u => u.Rol)
                .Select(g => new { Rol = g.Key.ToString(), Count = g.Count() })
                .ToDictionaryAsync(x => x.Rol, x => x.Count, cancellationToken);
                
            var totalConsultas = await _context.Set<LogConsulta>().CountAsync(cancellationToken);
            var totalProyectosRegistrados = await _context.Set<LogProyecto>().CountAsync(cancellationToken);

            return new DashboardStatsDto
            {
                TotalUsuarios = totalUsuarios,
                SuscripcionesActivas = suscripcionesActivas,
                IngresosMensualesEstimados = ingresosMensualesEstimados,
                TotalProyectos = totalProyectos,
                ProyectosPendientes = proyectosPendientes,
                ProyectosAprobados = proyectosAprobados,
                ProyectosRechazados = proyectosRechazados,
                SuscripcionesRecientes = suscripcionesRecientes,
                ProyectosRecientes = proyectosRecientes,
                UsuariosPorRol = usuariosPorRol,
                TotalConsultasRealizadas = totalConsultas,
                TotalProyectosRegistrados = totalProyectosRegistrados
            };
        }
    }
}
