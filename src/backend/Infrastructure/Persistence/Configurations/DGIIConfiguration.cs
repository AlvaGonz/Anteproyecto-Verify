namespace Infrastructure.Persistence.Configurations;

using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class DGIIConfiguration : IEntityTypeConfiguration<DGII>
{
    public void Configure(EntityTypeBuilder<DGII> builder)
    {
        builder.ToTable("DGII");
        builder.HasKey(d => d.Rnc);
        builder.Property(d => d.Rnc).HasMaxLength(20);
        builder.Property(d => d.NombreRazonSocial).IsRequired().HasMaxLength(250);
        builder.Property(d => d.NombreComercial).HasMaxLength(250);
        builder.Property(d => d.Categoria).HasMaxLength(100);
        builder.Property(d => d.RegimenPagos).HasMaxLength(100);
        builder.Property(d => d.Estado).HasMaxLength(50);
        builder.Property(d => d.ActividadEconomica).HasMaxLength(250);
        builder.Property(d => d.AdministracionLocal).HasMaxLength(100);
        builder.Property(d => d.FacturadorElectronico).HasMaxLength(50);
        builder.Property(d => d.LicenciasVhm).HasMaxLength(100);
    }
}
