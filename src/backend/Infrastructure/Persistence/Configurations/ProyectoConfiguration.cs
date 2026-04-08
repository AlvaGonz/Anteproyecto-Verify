namespace Infrastructure.Persistence.Configurations;

using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class ProyectoConfiguration : IEntityTypeConfiguration<Proyecto>
{
    public void Configure(EntityTypeBuilder<Proyecto> builder)
    {
        builder.HasKey(p => p.Id);
        builder.Property(p => p.CodigoInterno).IsRequired().HasMaxLength(50);
        builder.HasIndex(p => p.CodigoInterno).IsUnique();
        builder.Property(p => p.Nombre).IsRequired().HasMaxLength(200);
        builder.Property(p => p.UbicacionTexto).IsRequired().HasMaxLength(500);
        builder.Property(p => p.UbicacionGps).HasMaxLength(100);
        builder.Property(p => p.ValorEstimado).HasColumnType("decimal(18,2)");
        builder.Property(p => p.EstadoProyecto).IsRequired();
        builder.Property(p => p.EstadoIntegridad).IsRequired();

        builder.HasOne(p => p.UsuarioCreador)
            .WithMany(u => u.Proyectos)
            .HasForeignKey(p => p.UsuarioCreadorId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
