using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations;

public class PermisoSueloConfiguration : IEntityTypeConfiguration<PermisoSuelo>
{
    public void Configure(EntityTypeBuilder<PermisoSuelo> builder)
    {
        builder.ToTable("PermisoSuelo");
        builder.HasKey(p => p.IdPSuelo);

        builder.Property(p => p.Latitud).HasPrecision(18, 6);
        builder.Property(p => p.Longitud).HasPrecision(18, 6);
        builder.Property(p => p.Superficie).HasPrecision(18, 2);
    }
}
