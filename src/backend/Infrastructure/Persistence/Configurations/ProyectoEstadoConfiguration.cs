namespace Infrastructure.Persistence.Configurations;

using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class ProyectoEstadoConfiguration : IEntityTypeConfiguration<ProyectoEstado>
{
    public void Configure(EntityTypeBuilder<ProyectoEstado> builder)
    {
        builder.ToTable("ProyectosEstados");
        builder.HasKey(e => e.Id);
        
        builder.Property(e => e.CodigoUnico).IsRequired().HasMaxLength(50);
        builder.HasIndex(e => e.CodigoUnico).IsUnique();
        
        builder.Property(e => e.Nombre).IsRequired().HasMaxLength(100);
        builder.Property(e => e.Descripcion).IsRequired().HasMaxLength(500);
        builder.Property(e => e.Condiciones).IsRequired().HasMaxLength(1000);
        builder.Property(e => e.ColorHex).IsRequired().HasMaxLength(20);
        builder.Property(e => e.Activo).IsRequired().HasDefaultValue(true);
    }
}
