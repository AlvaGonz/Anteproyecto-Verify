namespace Infrastructure.Persistence;

using Domain.Entities;
using Microsoft.EntityFrameworkCore;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Usuario> Usuarios => Set<Usuario>();
    public DbSet<Proyecto> Proyectos => Set<Proyecto>();
    public DbSet<ProyectoEstado> ProyectoEstados => Set<ProyectoEstado>();
    public DbSet<Documento> Documentos => Set<Documento>();
    public DbSet<Validacion> Validaciones => Set<Validacion>();
    public DbSet<ResultadoRegla> ResultadosRegla => Set<ResultadoRegla>();
    public DbSet<Hallazgo> Hallazgos => Set<Hallazgo>();
    public DbSet<Auditoria> Auditorias => Set<Auditoria>();
    public DbSet<Reporte> Reportes => Set<Reporte>();
    public DbSet<Certificacion> Certificaciones => Set<Certificacion>();
    public DbSet<Invitacion> Invitaciones => Set<Invitacion>();
    public DbSet<Notificacion> Notificaciones => Set<Notificacion>();
    public DbSet<SesionUsuario> SesionesUsuario => Set<SesionUsuario>();

    // Legacy Tables for Admin Settings
    public DbSet<UsuarioLegacy> UsuariosLegacy => Set<UsuarioLegacy>();
    public DbSet<Perfil> Perfiles => Set<Perfil>();
    public DbSet<Permiso> Permisos => Set<Permiso>();
    public DbSet<Acceso> Accesos => Set<Acceso>();
    public DbSet<PlanSuscripcion> PlanesSuscripcion => Set<PlanSuscripcion>();
    public DbSet<Pago> PagosLegacy => Set<Pago>();
    public DbSet<PerfilPermiso> PerfilPermisos => Set<PerfilPermiso>();

    // Validation Entities
    public DbSet<AlertaValidacion> AlertasValidacion => Set<AlertaValidacion>();
    public DbSet<ValidacionDgii> ValidacionesDgii => Set<ValidacionDgii>();
    public DbSet<ValidacionAyuntamiento> ValidacionesAyuntamiento => Set<ValidacionAyuntamiento>();
    public DbSet<DeteccionDuplicidad> DeteccionesDuplicidad => Set<DeteccionDuplicidad>();
    public DbSet<DGII> DGII => Set<DGII>();
    
    // RF-11 to RF-15 Entities
    public DbSet<ConsentimientoFinanciero> ConsentimientosFinancieros => Set<ConsentimientoFinanciero>();
    public DbSet<ResultadoCrediticio> ResultadosCrediticios => Set<ResultadoCrediticio>();
    public DbSet<SelloIntegridad> SellosIntegridad => Set<SelloIntegridad>();
    public DbSet<ReglaValidacion> ReglasValidacion => Set<ReglaValidacion>();

    // Logging & Tokens
    public DbSet<LogConsulta> LogConsultas => Set<LogConsulta>();
    public DbSet<LogProyecto> LogProyectos => Set<LogProyecto>();
    public DbSet<ProyectoInteresado> ProyectosInteresados => Set<ProyectoInteresado>();
    public DbSet<ProyectoGuardado> ProyectosGuardados => Set<ProyectoGuardado>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.Entity<Usuario>().ToTable("Usuario");
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);

        // ProjectInterest Config
        modelBuilder.Entity<ProyectoInteresado>()
            .ToTable("ProyectoInteres")
            .HasOne(i => i.Project)
            .WithMany()
            .HasForeignKey(i => i.ProjectId)
            .OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<ProyectoInteresado>()
            .HasOne(i => i.Creator)
            .WithMany()
            .HasForeignKey(i => i.CreatorId)
            .OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<ProyectoInteresado>()
            .HasOne(i => i.InterestedUser)
            .WithMany()
            .HasForeignKey(i => i.InterestedUserId)
            .OnDelete(DeleteBehavior.Restrict);

        // SavedProject Config
        modelBuilder.Entity<ProyectoGuardado>()
            .ToTable("ProyectoGuardado")
            .HasOne(s => s.Project)
            .WithMany()
            .HasForeignKey(s => s.ProjectId)
            .OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<ProyectoGuardado>()
            .HasOne(s => s.Creator)
            .WithMany()
            .HasForeignKey(s => s.CreatorId)
            .OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<ProyectoGuardado>()
            .HasOne(s => s.Saver)
            .WithMany()
            .HasForeignKey(s => s.SaverId)
            .OnDelete(DeleteBehavior.Restrict);

        // SesionUsuario Config
        modelBuilder.Entity<SesionUsuario>()
            .ToTable("SesionUsuario")
            .HasOne(s => s.Usuario)
            .WithMany()
            .HasForeignKey(s => s.UsuarioId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
