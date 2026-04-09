namespace Infrastructure.Persistence.Configurations;

using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class SelloIntegridadConfiguration : IEntityTypeConfiguration<SelloIntegridad>
{
    public void Configure(EntityTypeBuilder<SelloIntegridad> builder)
    {
        builder.ToTable("SellosIntegridad");

        builder.HasKey(s => s.Id);

        builder.Property(s => s.CodigoSello)
            .IsRequired()
            .HasMaxLength(50);

        builder.HasIndex(s => s.CodigoSello)
            .IsUnique();

        builder.Property(s => s.UrlQr)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(s => s.FirmaDigital)
            .IsRequired()
            .HasMaxLength(1000);

        builder.HasOne(s => s.Proyecto)
            .WithMany()
            .HasForeignKey(s => s.ProyectoId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
