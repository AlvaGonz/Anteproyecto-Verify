namespace Infrastructure.Persistence.Configurations;

using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class Verificacion2FAConfiguration : IEntityTypeConfiguration<Verificacion2FA>
{
    public void Configure(EntityTypeBuilder<Verificacion2FA> builder)
    {
        builder.ToTable("Verificacion2FA");
        builder.HasKey(v => v.Id);
        builder.Property(v => v.SesionId).IsRequired().HasMaxLength(200);
        builder.Property(v => v.NumeroVerificable).IsRequired().HasMaxLength(6);
        builder.Property(v => v.FechaCreacion).IsRequired();
        builder.HasOne(v => v.Usuario)
            .WithMany()
            .HasForeignKey(v => v.UsuarioId)
            .OnDelete(DeleteBehavior.Cascade);
        builder.HasIndex(v => v.UsuarioId);
    }
}
