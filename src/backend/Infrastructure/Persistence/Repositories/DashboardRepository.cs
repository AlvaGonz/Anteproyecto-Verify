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

        public Task<DashboardStatsDto> GetAdminDashboardStatsAsync(CancellationToken cancellationToken = default)
            => GetAdminDashboardStatsInternalAsync(null, cancellationToken);

private async Task<DashboardStatsDto> GetAdminDashboardStatsInternalAsync(Guid? userId, CancellationToken cancellationToken)
        {
            var proyectosQuery = userId.HasValue
                ? _context.Set<Proyecto>().Where(p => p.UsuarioCreadorId == userId.Value)
                : _context.Set<Proyecto>();
            var activeUsersQuery = _context.Set<Usuario>()
                .Where(u => u.Activo && u.AccountStatus == Domain.Enums.UserAccountStatus.Active && u.Rol != Domain.Enums.UserRole.Administrator && (u.Plan == null || u.Plan.NombrePlan != "Consultor"));

            // Execute queries that can be done sequentially to avoid DbContext concurrency issues
            var totalUsuarios = await activeUsersQuery.CountAsync(cancellationToken);
            var suscripcionesActivas = await activeUsersQuery.CountAsync(u => u.PlanSuscripcionId != null && u.TitularId == null, cancellationToken);
            var ingresosMensualesEstimados = await activeUsersQuery
                .Include(u => u.Plan)
                .Where(u => u.PlanSuscripcionId != null && u.Plan != null && u.TitularId == null)
                .SumAsync(u => u.Plan!.Precio, cancellationToken);

            var totalProyectos = await proyectosQuery.CountAsync(cancellationToken);
            var proyectosPendientes = await proyectosQuery.CountAsync(p => p.Estado != null && (p.Estado.CodigoUnico == "CREADO" || p.Estado.CodigoUnico == "REVISION"), cancellationToken);
            var proyectosAprobados = await proyectosQuery.CountAsync(p => p.Estado != null && p.Estado.CodigoUnico == "PUBLICADO", cancellationToken);
            var proyectosRechazados = await proyectosQuery.CountAsync(p => p.Estado != null && p.Estado.CodigoUnico == "OBSERVACION", cancellationToken);

            var suscripcionesRecientes = await activeUsersQuery
                .Include(u => u.Plan)
                .Where(u => u.PlanSuscripcionId != null)
                .OrderByDescending(u => u.UpdatedAtUtc ?? u.CreatedAtUtc)
                .Take(15)
                .Select(u => new SuscripcionRecienteDto
                {
                    FechaAlta = u.UpdatedAtUtc ?? u.CreatedAtUtc,
                    Plan = u.TitularId != null ? "Invitado" : (u.Plan != null ? u.Plan.NombrePlan : "N/A"),
                    Correo = u.CorreoElectronico,
                    Estado = u.Activo ? "Activa" : "Inactiva"
                })
                .ToListAsync(cancellationToken);

            var proyectosRecientes = await proyectosQuery
                .Include(p => p.UsuarioCreador)
                .Include(p => p.Estado)
                .OrderByDescending(p => p.CreatedAtUtc)
                .Take(15)
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
            var totalOfertas = await _context.Set<ProyectoInteresado>().Where(pi => !userId.HasValue || pi.Project.UsuarioCreadorId == userId.Value).CountAsync(cancellationToken);

            var proyectosPorMes = await proyectosQuery
                .GroupBy(p => new { p.CreatedAtUtc.Year, p.CreatedAtUtc.Month })
                .OrderBy(g => g.Key.Year)
                .ThenBy(g => g.Key.Month)
                .Select(g => new ProyectosPorMesDto
                {
                    Year = g.Key.Year,
                    Month = g.Key.Month,
                    Count = g.Count()
                })
                .ToListAsync(cancellationToken);

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
                TotalProyectosRegistrados = totalProyectos,
                TotalOfertas = totalOfertas,
                ProyectosPorMes = proyectosPorMes
            };
        }

        public Task<DashboardStatsDto> GetUserDashboardStatsAsync(Guid userId, CancellationToken cancellationToken = default)
            => GetAdminDashboardStatsInternalAsync(userId, cancellationToken);
    }
}
