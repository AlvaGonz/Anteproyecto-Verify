namespace Infrastructure.Persistence.Configurations;

using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class LogProyectoConfiguration : IEntityTypeConfiguration<LogProyecto>
{
    public void Configure(EntityTypeBuilder<LogProyecto> builder)
    {
        builder.ToTable("LogProyectos");

        builder.HasKey(e => e.Id);
        
        builder.Property(e => e.Detalle)
               .HasMaxLength(500);

        builder.HasOne(e => e.Usuario)
               .WithMany()
               .HasForeignKey(e => e.UsuarioId)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.Proyecto)
               .WithMany()
               .HasForeignKey(e => e.ProyectoId)
               .OnDelete(DeleteBehavior.Restrict);
               
        builder.HasIndex(e => e.UsuarioId);
        builder.HasIndex(e => e.FechaCreacion);
    }
}
