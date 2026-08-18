namespace Infrastructure.Persistence.Configurations;

using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class ReglaValidacionConfiguration : IEntityTypeConfiguration<ReglaValidacion>
{
    public void Configure(EntityTypeBuilder<ReglaValidacion> builder)
    {
        builder.ToTable("ReglasValidacion");
        builder.HasKey(r => r.Id);
        builder.Property(r => r.Nombre).IsRequired().HasMaxLength(200);
        builder.Property(r => r.Codigo).HasMaxLength(100);
        builder.Property(r => r.Descripcion).HasMaxLength(1000);
        builder.Property(r => r.CondicionLogica).IsRequired().HasMaxLength(2000);
        builder.Property(r => r.Expresion).HasMaxLength(500);
        builder.Property(r => r.ValorUmbral).HasPrecision(18, 4);
        builder.Property(r => r.MinValor).HasPrecision(18, 4);
        builder.Property(r => r.MaxValor).HasPrecision(18, 4);
        builder.Property(r => r.TipoDocumentoAplicable).IsRequired();
        builder.Property(r => r.NivelAlerta).IsRequired();
        builder.Property(r => r.TipoProyecto).IsRequired();
        builder.Property(r => r.Activa).IsRequired();
        builder.Property(r => r.Version).IsRequired();
        builder.Property(r => r.FechaCreacionUtc).IsRequired();
        builder.Property(r => r.CreadaPor).IsRequired();
        builder.Property(r => r.RowVersion).IsRowVersion();
    }
}
