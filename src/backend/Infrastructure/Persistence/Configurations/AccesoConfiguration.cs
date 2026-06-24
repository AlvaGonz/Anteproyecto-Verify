namespace Infrastructure.Persistence.Configurations;

using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class AccesoConfiguration : IEntityTypeConfiguration<Acceso>
{
    public void Configure(EntityTypeBuilder<Acceso> builder)
    {
        builder.ToTable("Acceso", t => t.ExcludeFromMigrations());
        builder.HasKey(a => a.IdAcceso);
        
        builder.Property(a => a.IdAcceso).HasColumnName("IdAcceso").ValueGeneratedOnAdd();
        builder.Property(a => a.IdPerfil).HasColumnName("IdPerfil");
        builder.Property(a => a.IdUsuario).HasColumnName("IdUsuario");

        builder.HasOne(a => a.Perfil)
            .WithMany()
            .HasForeignKey(a => a.IdPerfil)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(a => a.UsuarioLegacy)
            .WithMany()
            .HasForeignKey(a => a.IdUsuario)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
