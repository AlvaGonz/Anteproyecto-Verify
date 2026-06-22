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
    public DbSet<Documento> Documentos => Set<Documento>();
    public DbSet<Validacion> Validaciones => Set<Validacion>();
    public DbSet<ResultadoRegla> ResultadosRegla => Set<ResultadoRegla>();
    public DbSet<Hallazgo> Hallazgos => Set<Hallazgo>();
    public DbSet<Auditoria> Auditorias => Set<Auditoria>();
    public DbSet<Reporte> Reportes => Set<Reporte>();
    public DbSet<Certificacion> Certificaciones => Set<Certificacion>();
    public DbSet<Notificacion> Notificaciones => Set<Notificacion>();

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
    public DbSet<DgiiRnc> DgiiRnc => Set<DgiiRnc>();
    
    // RF-11 to RF-15 Entities
    public DbSet<ConsentimientoFinanciero> ConsentimientosFinancieros => Set<ConsentimientoFinanciero>();
    public DbSet<ResultadoCrediticio> ResultadosCrediticios => Set<ResultadoCrediticio>();
    public DbSet<SelloIntegridad> SellosIntegridad => Set<SelloIntegridad>();
    public DbSet<ReglaValidacion> ReglasValidacion => Set<ReglaValidacion>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.Entity<Usuario>().ToTable("Usuario");
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}
