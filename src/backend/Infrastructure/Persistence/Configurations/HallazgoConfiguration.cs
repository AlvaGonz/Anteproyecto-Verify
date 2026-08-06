namespace Infrastructure.Persistence.Configurations;

using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class HallazgoConfiguration : IEntityTypeConfiguration<Hallazgo>
{
    public void Configure(EntityTypeBuilder<Hallazgo> builder)
    {
        builder.HasKey(h => h.Id);
        builder.Property(h => h.Codigo).IsRequired().HasMaxLength(50);
        builder.Property(h => h.Titulo).IsRequired().HasMaxLength(200);
        builder.Property(h => h.Descripcion).IsRequired().HasMaxLength(2000);
        builder.Property(h => h.Recomendacion).HasMaxLength(2000);

        builder.HasOne(h => h.Proyecto)
            .WithMany(p => p.Hallazgos)
            .HasForeignKey(h => h.ProyectoId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(h => h.Validacion)
            .WithMany(v => v.Hallazgos)
            .HasForeignKey(h => h.ValidacionId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Property(h => h.Campo).HasMaxLength(100);

        builder.HasOne(h => h.DatoValidado)
            .WithMany()
            .HasForeignKey(h => h.DatoValidadoId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
