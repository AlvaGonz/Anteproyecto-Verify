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

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}
