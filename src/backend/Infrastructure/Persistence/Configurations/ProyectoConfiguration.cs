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
        builder.Property(p => p.Cercania).HasColumnName("Cercania").HasMaxLength(1000);
        builder.Property(p => p.ImagenUrl).HasMaxLength(2048);
        builder.Property(p => p.ImagenAdicional1).HasMaxLength(2048);
        builder.Property(p => p.ImagenAdicional2).HasMaxLength(2048);
        builder.Property(p => p.ImagenAdicional3).HasMaxLength(2048);
        builder.Property(p => p.ImagenAdicional4).HasMaxLength(2048);
        builder.Property(p => p.ImagenAdicional5).HasMaxLength(2048);
        builder.Property(p => p.Propietario).HasMaxLength(200);
        builder.Property(p => p.CedulaRncPropietario).HasMaxLength(50);
        builder.Property(p => p.Ipi).HasMaxLength(50);
        builder.Property(p => p.ValorEstimado).HasColumnType("decimal(18,2)");
        builder.Property(p => p.EstadoId).HasColumnName("EstadoId").IsRequired();

        builder.HasOne(p => p.Estado)
            .WithMany(e => e.Proyectos)
            .HasForeignKey(p => p.EstadoId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Property(p => p.SuperficieM2).HasColumnType("decimal(18,2)");
        builder.Property(p => p.EstadoIntegridad).IsRequired();

        builder.HasOne(p => p.UsuarioCreador)
            .WithMany(u => u.Proyectos)
            .HasForeignKey(p => p.UsuarioCreadorId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(p => p.CategoriaProyecto)
            .WithMany()
            .HasForeignKey(p => p.CategoriaId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Property(p => p.UsuarioCreadorId)
            .HasColumnName("IdUsuario");
    }
}
