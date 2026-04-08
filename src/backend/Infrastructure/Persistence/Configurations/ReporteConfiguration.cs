namespace Infrastructure.Persistence.Configurations;

using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class ReporteConfiguration : IEntityTypeConfiguration<Reporte>
{
    public void Configure(EntityTypeBuilder<Reporte> builder)
    {
        builder.HasKey(r => r.Id);
        builder.Property(r => r.Resumen).HasMaxLength(4000);

        builder.HasOne(r => r.Proyecto)
            .WithMany(p => p.Reportes)
            .HasForeignKey(r => r.ProyectoId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(r => r.GeneradoPorUsuario)
            .WithMany()
            .HasForeignKey(r => r.GeneradoPorUsuarioId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
