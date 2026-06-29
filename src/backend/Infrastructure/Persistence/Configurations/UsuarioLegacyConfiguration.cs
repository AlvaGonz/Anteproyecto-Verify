namespace Infrastructure.Persistence.Configurations;

using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class UsuarioLegacyConfiguration : IEntityTypeConfiguration<UsuarioLegacy>
{
    public void Configure(EntityTypeBuilder<UsuarioLegacy> builder)
    {
        builder.ToTable("UsuarioLegacy");
        builder.HasKey(u => u.IdUsuario);
        
        builder.Property(u => u.IdUsuario).HasColumnName("IdUsuario").ValueGeneratedOnAdd();
        builder.Property(u => u.Nombre).IsRequired().HasMaxLength(100);
        builder.Property(u => u.Apellido).IsRequired().HasMaxLength(100);
        builder.Property(u => u.NombreCompleto).HasComputedColumnSql("[Nombre] + ' ' + [Apellido]", stored: true);
        builder.Property(u => u.Email).IsRequired().HasMaxLength(100);
        builder.Property(u => u.ContrasenaHash).IsRequired().HasMaxLength(255);
        builder.Property(u => u.Telefono).IsRequired().HasMaxLength(15);
        builder.Property(u => u.Cedula).IsRequired().HasMaxLength(15);

        // Unique index on Email for fast lookups (used in legacy sync and user queries)
        builder.HasIndex(u => u.Email).IsUnique().HasDatabaseName("IX_UsuarioLegacy_Email");
    }
}
