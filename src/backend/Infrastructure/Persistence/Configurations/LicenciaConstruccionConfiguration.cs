namespace Infrastructure.Persistence.Configurations;

using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class LicenciaConstruccionConfiguration : IEntityTypeConfiguration<LicenciaConstruccion>
{
    public void Configure(EntityTypeBuilder<LicenciaConstruccion> builder)
    {
        builder.ToTable("LicenciaConstruccion");
        builder.HasKey(l => l.MivedId);
        builder.Property(l => l.MivedId).HasDefaultValueSql("NEWID()");
        builder.Property(l => l.NumeroPermiso).IsRequired().HasMaxLength(50);
        builder.Property(l => l.NombreProyecto).IsRequired().HasMaxLength(500);
        builder.Property(l => l.Tipologia).HasMaxLength(100);
        builder.Property(l => l.Provincia).HasMaxLength(100);
        builder.Property(l => l.Municipio).HasMaxLength(100);
        builder.HasIndex(l => l.NumeroPermiso);

        builder.Property(l => l.Rnc).HasMaxLength(20);

        builder.HasOne<DGII>()
            .WithMany()
            .HasForeignKey(l => l.Rnc)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
