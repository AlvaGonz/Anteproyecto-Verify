namespace Infrastructure.Persistence.Configurations;

using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class ProvinciaConfiguration : IEntityTypeConfiguration<Provincia>
{
    public void Configure(EntityTypeBuilder<Provincia> builder)
    {
        builder.ToTable("Provincia");
        builder.HasKey(p => p.IdProvincia);
        builder.Property(p => p.NombreProvincia).IsRequired().HasMaxLength(100);
        builder.Property(p => p.Latitud).HasColumnType("decimal(18,10)");
        builder.Property(p => p.Longitud).HasColumnType("decimal(18,10)");
    }
}
