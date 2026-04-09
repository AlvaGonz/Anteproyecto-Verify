namespace Infrastructure.Persistence.Configurations;

using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class ConsentimientoFinancieroConfiguration : IEntityTypeConfiguration<ConsentimientoFinanciero>
{
    public void Configure(EntityTypeBuilder<ConsentimientoFinanciero> builder)
    {
        builder.ToTable("ConsentimientosFinancieros");

        builder.HasKey(c => c.Id);

        builder.Property(c => c.IpOrigen)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(c => c.VersionPolitica)
            .IsRequired()
            .HasMaxLength(20);

        builder.HasOne(c => c.Usuario)
            .WithMany()
            .HasForeignKey(c => c.UsuarioId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
