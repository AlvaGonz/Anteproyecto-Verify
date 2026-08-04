namespace Infrastructure.Persistence.Configurations;

using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class MunicipioConfiguration : IEntityTypeConfiguration<Municipio>
{
    public void Configure(EntityTypeBuilder<Municipio> builder)
    {
        builder.ToTable("Municipio");
        builder.HasKey(m => m.IdMunicipio);
        builder.Property(m => m.NombreMunicipio).IsRequired().HasMaxLength(100);
        builder.Property(m => m.Latitud).HasColumnType("decimal(9,6)");
        builder.Property(m => m.Longitud).HasColumnType("decimal(9,6)");

        builder.HasOne(m => m.Provincia)
            .WithMany(p => p.Municipios)
            .HasForeignKey(m => m.IdProvincia)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
