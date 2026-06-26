namespace Infrastructure.Persistence.Configurations;

using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class PerfilPermisoConfiguration : IEntityTypeConfiguration<PerfilPermiso>
{
    public void Configure(EntityTypeBuilder<PerfilPermiso> builder)
    {
        builder.ToTable("PerfilPermiso");
        builder.HasKey(pp => new { pp.IdPerfil, pp.IdPermiso });

        builder.Property(pp => pp.IdPerfil).HasColumnName("IdPerfil");
        builder.Property(pp => pp.IdPermiso).HasColumnName("IdPermiso");

        builder.HasOne(pp => pp.Perfil)
            .WithMany()
            .HasForeignKey(pp => pp.IdPerfil)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(pp => pp.Permiso)
            .WithMany()
            .HasForeignKey(pp => pp.IdPermiso)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
