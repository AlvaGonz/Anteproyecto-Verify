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
    public DbSet<DatoValidado> DatosValidados => Set<DatoValidado>();
    public DbSet<ResultadoRegla> ResultadosRegla => Set<ResultadoRegla>();
    public DbSet<Hallazgo> Hallazgos => Set<Hallazgo>();
    public DbSet<Auditoria> Auditorias => Set<Auditoria>();
    public DbSet<Reporte> Reportes => Set<Reporte>();
    public DbSet<Certificacion> Certificaciones => Set<Certificacion>();
    public DbSet<Invitacion> Invitaciones => Set<Invitacion>();
    public DbSet<Notificacion> Notificaciones => Set<Notificacion>();
    public DbSet<TipoNotificacion> TiposNotificaciones => Set<TipoNotificacion>();
    public DbSet<NotificacionEntrega> NotificacionEntregas => Set<NotificacionEntrega>();
    public DbSet<SesionUsuario> SesionesUsuario => Set<SesionUsuario>();

    public DbSet<Perfil> Perfiles => Set<Perfil>();
    public DbSet<Permiso> Permisos => Set<Permiso>();
    public DbSet<PlanSuscripcion> PlanesSuscripcion => Set<PlanSuscripcion>();
    public DbSet<Pago> Pagos => Set<Pago>();
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
    public DbSet<ProyectoValidacionDescargo> ProyectosValidacionDescargos => Set<ProyectoValidacionDescargo>();

    // External Data
    public DbSet<LicenciaConstruccion> LicenciasConstruccion => Set<LicenciaConstruccion>();
    public DbSet<Verificacion2FA> Verificaciones2FA => Set<Verificacion2FA>();
    
    // Entidades Gubernamentales Simuladas (Mock DB)
    public DbSet<CatastroTitulo> CatastroTitulos => Set<CatastroTitulo>();
    public DbSet<PermisoSuelo> PermisosSuelo => Set<PermisoSuelo>();
    public DbSet<JCE_Ciudadano> JCE_Ciudadanos => Set<JCE_Ciudadano>();
    public DbSet<PagoIPI> PagosIPI => Set<PagoIPI>();

    // Geo
    public DbSet<Provincia> Provincias => Set<Provincia>();
    public DbSet<Municipio> Municipios => Set<Municipio>();

    // Project Categories
    public DbSet<CategoriaProyecto> CategoriasProyecto => Set<CategoriaProyecto>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.Entity<Usuario>().ToTable("Usuario");
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);

        // Project Categories
        modelBuilder.Entity<CategoriaProyecto>(entity =>
        {
            entity.HasIndex(e => e.Nombre).IsUnique();
        });

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

        // ValidationDisclaimer Config
        modelBuilder.Entity<ProyectoValidacionDescargo>()
            .ToTable("ProyectoValidacionDescargo")
            .HasIndex(d => new { d.UsuarioId, d.ProyectoId })
            .IsUnique();
        modelBuilder.Entity<ProyectoValidacionDescargo>()
            .HasOne(d => d.Usuario)
            .WithMany()
            .HasForeignKey(d => d.UsuarioId)
            .OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<ProyectoValidacionDescargo>()
            .HasOne(d => d.Proyecto)
            .WithMany()
            .HasForeignKey(d => d.ProyectoId)
            .OnDelete(DeleteBehavior.Cascade);

        // Notification Taxonomy
        modelBuilder.Entity<TipoNotificacion>(entity =>
        {
            entity.ToTable("TiposNotificaciones");
            entity.HasIndex(e => e.Codigo).IsUnique();
        });

        modelBuilder.Entity<Notificacion>(entity =>
        {
            entity.ToTable("Notificaciones");
            entity.HasOne(n => n.Usuario)
                .WithMany()
                .HasForeignKey(n => n.UsuarioId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(n => n.TipoNotificacion)
                .WithMany()
                .HasForeignKey(n => n.TipoNotificacionId)
                .OnDelete(DeleteBehavior.SetNull);
            entity.HasIndex(n => new { n.UsuarioId, n.TipoNotificacionId })
                .HasFilter("[TipoNotificacionId] IS NOT NULL");
        });

        modelBuilder.Entity<NotificacionEntrega>(entity =>
        {
            entity.ToTable("NotificacionEntregas");
            entity.HasIndex(e => e.NotificacionId);
            entity.HasIndex(e => new { e.NotificacionId, e.Canal }).IsUnique();
            entity.HasOne(e => e.Notificacion)
                .WithMany(n => n.Entregas)
                .HasForeignKey(e => e.NotificacionId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
