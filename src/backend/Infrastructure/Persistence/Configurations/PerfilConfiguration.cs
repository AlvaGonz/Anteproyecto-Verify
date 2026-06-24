namespace Infrastructure.Persistence.Configurations;

using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class PerfilConfiguration : IEntityTypeConfiguration<Perfil>
{
    public void Configure(EntityTypeBuilder<Perfil> builder)
    {
        builder.ToTable("Perfiles", t => t.ExcludeFromMigrations());
        builder.HasKey(p => p.IdPerfil);
        
        builder.Property(p => p.IdPerfil).HasColumnName("IdPerfil").ValueGeneratedOnAdd();
        builder.Property(p => p.NombrePerfil).IsRequired().HasMaxLength(100);
    }
}
