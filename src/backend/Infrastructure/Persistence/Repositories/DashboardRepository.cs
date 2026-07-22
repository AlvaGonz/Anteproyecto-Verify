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

            var totalUsuariosTask = activeUsersQuery.CountAsync(cancellationToken);
            var suscripcionesActivasTask = activeUsersQuery.CountAsync(u => u.PlanSuscripcionId != null && u.TitularId == null, cancellationToken);
            var ingresosMensualesEstimadosTask = activeUsersQuery
                .Include(u => u.Plan)
                .Where(u => u.PlanSuscripcionId != null && u.Plan != null && u.TitularId == null)
                .SumAsync(u => u.Plan!.Precio, cancellationToken);

            var totalProyectosTask = _context.Set<Proyecto>().CountAsync(cancellationToken);
            var proyectosPendientesTask = _context.Set<Proyecto>().CountAsync(p => p.Estado != null && (p.Estado.CodigoUnico == "CREADO" || p.Estado.CodigoUnico == "REVISION"), cancellationToken);
            var proyectosAprobadosTask = _context.Set<Proyecto>().CountAsync(p => p.Estado != null && p.Estado.CodigoUnico == "PUBLICADO", cancellationToken);
            var proyectosRechazadosTask = _context.Set<Proyecto>().CountAsync(p => p.Estado != null && p.Estado.CodigoUnico == "OBSERVACION", cancellationToken);

            var suscripcionesRecientesTask = activeUsersQuery
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

            var proyectosRecientesTask = _context.Set<Proyecto>()
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

            var usuariosPorPlanTask = activeUsersQuery
                .Include(u => u.Plan)
                .GroupBy(u => u.TitularId != null ? "Invitado" : (u.Plan != null ? u.Plan.NombrePlan : "Gratuito"))
                .Select(g => new { Plan = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.Plan, x => x.Count, cancellationToken);

            var totalConsultasTask = _context.Set<LogConsulta>().CountAsync(cancellationToken);

            await Task.WhenAll(
                totalUsuariosTask, suscripcionesActivasTask, ingresosMensualesEstimadosTask,
                totalProyectosTask, proyectosPendientesTask, proyectosAprobadosTask, proyectosRechazadosTask,
                suscripcionesRecientesTask, proyectosRecientesTask, usuariosPorPlanTask, totalConsultasTask
            );

            return new DashboardStatsDto
            {
                TotalUsuarios = totalUsuariosTask.Result,
                SuscripcionesActivas = suscripcionesActivasTask.Result,
                IngresosMensualesEstimados = ingresosMensualesEstimadosTask.Result,
                TotalProyectos = totalProyectosTask.Result,
                ProyectosPendientes = proyectosPendientesTask.Result,
                ProyectosAprobados = proyectosAprobadosTask.Result,
                ProyectosRechazados = proyectosRechazadosTask.Result,
                SuscripcionesRecientes = suscripcionesRecientesTask.Result,
                ProyectosRecientes = proyectosRecientesTask.Result,
                UsuariosPorPlan = usuariosPorPlanTask.Result,
                TotalConsultasRealizadas = totalConsultasTask.Result,
                TotalProyectosRegistrados = totalProyectosTask.Result
            };
        }
    }
}
