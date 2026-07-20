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
            var activeUsersQuery = _context.Set<Usuario>()
                .Where(u => u.Activo && u.AccountStatus == Domain.Enums.UserAccountStatus.Active && u.Rol != Domain.Enums.UserRole.Administrator && (u.Plan == null || u.Plan.NombrePlan != "Consultor"));

            var totalUsuarios = await activeUsersQuery.CountAsync(cancellationToken);
            var suscripcionesActivas = await activeUsersQuery.CountAsync(u => u.PlanSuscripcionId != null && u.TitularId == null, cancellationToken);
            
            // Just an estimation logic
            var ingresosMensualesEstimados = await activeUsersQuery
                .Include(u => u.Plan)
                .Where(u => u.PlanSuscripcionId != null && u.Plan != null && u.TitularId == null)
                .SumAsync(u => u.Plan!.Precio, cancellationToken);

            var totalProyectos = await _context.Set<Proyecto>().CountAsync(cancellationToken);
            var proyectosPendientes = await _context.Set<Proyecto>().CountAsync(p => p.Estado != null && (p.Estado.CodigoUnico == "CREADO" || p.Estado.CodigoUnico == "REVISION"), cancellationToken);
            var proyectosAprobados = await _context.Set<Proyecto>().CountAsync(p => p.Estado != null && p.Estado.CodigoUnico == "PUBLICADO", cancellationToken);
            var proyectosRechazados = await _context.Set<Proyecto>().CountAsync(p => p.Estado != null && p.Estado.CodigoUnico == "OBSERVACION", cancellationToken);

            var suscripcionesRecientes = await activeUsersQuery
                .Include(u => u.Plan)
                .Where(u => u.PlanSuscripcionId != null)
                .OrderByDescending(u => u.UpdatedAtUtc ?? u.CreatedAtUtc)
                .Take(50)
                .Select(u => new SuscripcionRecienteDto
                {
                    FechaAlta = u.UpdatedAtUtc ?? u.CreatedAtUtc,
                    Plan = u.TitularId != null ? "Invitado" : (u.Plan != null ? u.Plan.NombrePlan : "N/A"),
                    Correo = u.CorreoElectronico,
                    Estado = u.Activo ? "Activa" : "Inactiva"
                })
                .ToListAsync(cancellationToken);

            var proyectosRecientes = await _context.Set<Proyecto>()
                .Include(p => p.UsuarioCreador)
                .Include(p => p.Estado)
                .OrderByDescending(p => p.CreatedAtUtc)
                .Take(50)
                .Select(p => new ProyectoRecienteDto
                {
                    FechaRegistro = p.CreatedAtUtc,
                    Nombre = p.Nombre,
                    Desarrollador = p.UsuarioCreador != null ? p.UsuarioCreador.NombreCompleto : "Desconocido",
                    Estado = p.Estado != null ? p.Estado.Nombre : "Desconocido",
                    ImagenUrl = p.ImagenUrl
                })
                .ToListAsync(cancellationToken);

            var usuariosPorPlan = await activeUsersQuery
                .Include(u => u.Plan)
                .GroupBy(u => u.TitularId != null ? "Invitado" : (u.Plan != null ? u.Plan.NombrePlan : "Gratuito"))
                .Select(g => new { Plan = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.Plan, x => x.Count, cancellationToken);
                
            var totalConsultas = await _context.Set<LogConsulta>().CountAsync(cancellationToken);

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
                UsuariosPorPlan = usuariosPorPlan,
                TotalConsultasRealizadas = totalConsultas,
                TotalProyectosRegistrados = totalProyectos
            };
        }
    }
}
