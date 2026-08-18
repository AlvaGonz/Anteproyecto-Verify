using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations;

public class CatastroTituloConfiguration : IEntityTypeConfiguration<CatastroTitulo>
{
    public void Configure(EntityTypeBuilder<CatastroTitulo> builder)
    {
        builder.ToTable("CatastroTitulo");
        builder.HasKey(c => c.IdCatastroTitulo);

        builder.Property(c => c.Latitud).HasPrecision(18, 6);
        builder.Property(c => c.Longitud).HasPrecision(18, 6);
        builder.Property(c => c.Superficie).HasPrecision(18, 2);

        builder.Property(c => c.Rnc).HasMaxLength(20);

        builder.HasOne<DGII>()
            .WithMany()
            .HasForeignKey(c => c.Rnc)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
