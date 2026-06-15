namespace Infrastructure.Persistence.Configurations;

using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class UsuarioConfiguration : IEntityTypeConfiguration<Usuario>
{
    public void Configure(EntityTypeBuilder<Usuario> builder)
    {
        builder.ToTable("Usuario");
        builder.HasKey(u => u.Id);
        builder.Property(u => u.Id).HasColumnName("IdUsuario");
        builder.Property(u => u.Nombre).IsRequired().HasMaxLength(100);
        builder.Property(u => u.Apellido).IsRequired().HasMaxLength(100);
        builder.Property(u => u.NombreCompleto).HasComputedColumnSql("[Nombre] + ' ' + [Apellido]", stored: true);
        
        builder.Property(u => u.CorreoElectronico).HasColumnName("Email").IsRequired().HasMaxLength(200);
        builder.HasIndex(u => u.CorreoElectronico).IsUnique();
        
        builder.Property(u => u.ContrasenaHash).IsRequired().HasMaxLength(500);
        builder.Property(u => u.Telefono).IsRequired().HasMaxLength(15);
        builder.Property(u => u.Cedula).IsRequired().HasMaxLength(15);
        builder.Property(u => u.Rol).IsRequired();
    }
}
