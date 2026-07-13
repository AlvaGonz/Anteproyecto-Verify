namespace Infrastructure.Persistence.Configurations;

using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class ProyectoConfiguration : IEntityTypeConfiguration<Proyecto>
{
    public void Configure(EntityTypeBuilder<Proyecto> builder)
    {
        builder.ToTable("ProyectosInmobiliarios");
        builder.HasKey(p => p.Id);
        builder.Property(p => p.Id).HasColumnName("IdProyecto");
        builder.Property(p => p.CodigoInterno).IsRequired().HasMaxLength(50);
        builder.HasIndex(p => p.CodigoInterno).IsUnique();
        builder.Property(p => p.Nombre).HasColumnName("NombreProyecto").IsRequired().HasMaxLength(200);
        builder.Property(p => p.UbicacionTexto).IsRequired().HasMaxLength(500);
        builder.Property(p => p.UbicacionGps).HasMaxLength(100);
        builder.Property(p => p.ImagenUrl).HasMaxLength(2048);
        builder.Property(p => p.Propietario).HasMaxLength(200);
        builder.Property(p => p.CedulaRncPropietario).HasMaxLength(50);
        builder.Property(p => p.Ipi).HasMaxLength(50);
        builder.Property(p => p.ValorEstimado).HasColumnType("decimal(18,2)");
        builder.Property(p => p.EstadoProyecto).HasColumnName("Status").IsRequired();
        builder.Property(p => p.EstatusDescripcion).HasMaxLength(50).IsRequired();
        builder.Property(p => p.SuperficieM2).HasColumnType("decimal(18,2)");
        builder.Property(p => p.EstadoIntegridad).IsRequired();

        builder.HasOne(p => p.UsuarioCreador)
            .WithMany(u => u.Proyectos)
            .HasForeignKey(p => p.UsuarioCreadorId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Property(p => p.UsuarioCreadorId)
            .HasColumnName("IdUsuario");
    }
}
