namespace Infrastructure.Persistence.Repositories;

using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Persistence;
using Application.Features.Subscriptions.Queries.GetMySubscriptionStatus;
using Domain.Entities;
using Domain.Policies;
using Microsoft.EntityFrameworkCore;

public class UsuarioRepository : IUsuarioRepository, Application.Features.Subscriptions.Queries.GetMySubscriptionStatus.IUserSubscriptionReadRepository
{
    private readonly AppDbContext _context;

    public UsuarioRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Usuario?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Usuarios.FindAsync(new object[] { id }, cancellationToken);
    }

    public async Task<Usuario?> GetByIdWithPlanAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Usuarios
            .AsSplitQuery()
            .Include(u => u.Plan)
            .Include(u => u.Titular)
                .ThenInclude(t => t!.Plan)
            .Include(u => u.MiembrosEquipo)
            .FirstOrDefaultAsync(u => u.Id == id, cancellationToken);
    }

    public async Task<Usuario?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return await _context.Usuarios
            .Include(u => u.MiembrosEquipo)
            .FirstOrDefaultAsync(u => u.CorreoElectronico.ToLower() == email.ToLower(), cancellationToken);
    }

    public async Task AddAsync(Usuario usuario, CancellationToken cancellationToken = default)
    {
        await _context.Usuarios.AddAsync(usuario, cancellationToken);
    }

    public void Update(Usuario usuario)
    {
        _context.Usuarios.Update(usuario);
    }

    public async Task<bool> ExistsByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return await _context.Usuarios
            .AnyAsync(u => u.CorreoElectronico.ToLower() == email.ToLower(), cancellationToken);
    }

    public async Task<bool> ExistsByCedulaAsync(string cedula, CancellationToken cancellationToken = default)
    {
        var cleanCedula = cedula.Replace("-", "");
        return await _context.Usuarios
            .AnyAsync(u => u.Cedula != null && u.Cedula.Replace("-", "") == cleanCedula, cancellationToken);
    }

    public async Task<Usuario?> GetByVerificationTokenAsync(string token, CancellationToken cancellationToken = default)
    {
        return await _context.Usuarios
            .FirstOrDefaultAsync(u => u.TokenVerificacion == token, cancellationToken);
    }

    public async Task<Usuario?> GetByPasswordResetTokenAsync(string token, CancellationToken cancellationToken = default)
    {
        return await _context.Usuarios
            .FirstOrDefaultAsync(u => u.PasswordResetToken == token, cancellationToken);
    }

    public async Task<Usuario?> GetByNicknameAsync(string nickname, CancellationToken cancellationToken = default)
    {
        return await _context.Usuarios
            .FirstOrDefaultAsync(u => u.Nickname != null && u.Nickname.ToLower() == nickname.ToLower(), cancellationToken);
    }

    public async Task<UserSubscriptionData?> GetUserWithPlansAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _context.Usuarios
            .AsNoTracking()
            .Where(u => u.Id == userId)
            .Select(u => new UserSubscriptionData
            {
                Id = u.Id,
                Plan = u.Plan != null ? new PlanData
                {
                    Idsuscripcion = u.Plan.Idsuscripcion,
                    NombrePlan = u.Plan.NombrePlan,
                    Precio = u.Plan.Precio,
                    MaxConsultas = u.Plan.MaxConsultas,
                    MaxProyectos = u.Plan.MaxProyectos,
                    PresentacionPublica = u.Plan.PresentacionPublica,
                    QrIncluido = u.Plan.QrIncluido,
                    MaxUsuariosSecundarios = u.Plan.MaxUsuariosSecundarios,
                    MaxAlmacenamientoMb = u.Plan.MaxAlmacenamientoMb,
                    AlertasTiempoRealDisponible = u.Plan.AlertasTiempoRealDisponible,
                    ModeloLmDisponible = u.Plan.ModeloLmDisponible,
                    ValidacionLoteDisponible = u.Plan.ValidacionLoteDisponible,
                    ExportacionExcelDisponible = u.Plan.ExportacionExcelDisponible,
                    ExportacionPdfDisponible = u.Plan.ExportacionPdfDisponible,
                    IntegracionCrmDisponible = u.Plan.IntegracionCrmDisponible,
                    SoporteTipo = u.Plan.SoporteTipo,
                    AccesoApi = u.Plan.AccesoApi
                } : null,
                ConsultasUsadas = _context.LogConsultas.Count(lc => lc.UsuarioId == u.Id),
                ProyectosCreados = _context.Proyectos.Count(p => p.UsuarioCreadorId == u.Id),
                SubscriptionStatus = u.SubscriptionStatus,
                CurrentPeriodEnd = u.CurrentPeriodEnd,
                CancelAtPeriodEnd = u.CancelAtPeriodEnd,
                CancelAt = u.CancelAt,
                StripeSubscriptionId = u.StripeSubscriptionId,
                PendingBillingCycle = u.PendingBillingCycle,
                StripeCustomerId = u.StripeCustomerId,
                TitularId = u.TitularId,
                Titular = u.Titular != null ? new UserSubscriptionData
                {
                    Id = u.Titular.Id,
                    Plan = u.Titular.Plan != null ? new PlanData
                    {
                        Idsuscripcion = u.Titular.Plan.Idsuscripcion,
                        NombrePlan = u.Titular.Plan.NombrePlan,
                        Precio = u.Titular.Plan.Precio,
                        MaxConsultas = u.Titular.Plan.MaxConsultas,
                        MaxProyectos = u.Titular.Plan.MaxProyectos,
                        PresentacionPublica = u.Titular.Plan.PresentacionPublica,
                        QrIncluido = u.Titular.Plan.QrIncluido,
                        MaxUsuariosSecundarios = u.Titular.Plan.MaxUsuariosSecundarios,
                        MaxAlmacenamientoMb = u.Titular.Plan.MaxAlmacenamientoMb,
                        AlertasTiempoRealDisponible = u.Titular.Plan.AlertasTiempoRealDisponible,
                        ModeloLmDisponible = u.Titular.Plan.ModeloLmDisponible,
                        ValidacionLoteDisponible = u.Titular.Plan.ValidacionLoteDisponible,
                        ExportacionExcelDisponible = u.Titular.Plan.ExportacionExcelDisponible,
                        ExportacionPdfDisponible = u.Titular.Plan.ExportacionPdfDisponible,
                        IntegracionCrmDisponible = u.Titular.Plan.IntegracionCrmDisponible,
                        SoporteTipo = u.Titular.Plan.SoporteTipo,
                        AccesoApi = u.Titular.Plan.AccesoApi
                    } : null,
                    NombreCompleto = u.Titular.NombreCompleto
                } : null,
                IsManagedByStripe = !string.IsNullOrEmpty(u.StripeSubscriptionId),
                NombreCompleto = u.NombreCompleto
            })
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<List<Usuario>> GetPendingPurgeAsync(CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        return await _context.Usuarios
            .Where(u => u.AccountStatus == Domain.Enums.UserAccountStatus.PendingDeletion)
            .Where(u => u.PurgeAtUtc != null && u.PurgeAtUtc <= now)
            .ToListAsync(cancellationToken);
    }
}
