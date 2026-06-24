namespace Infrastructure.Persistence.Configurations;

using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class PermisoConfiguration : IEntityTypeConfiguration<Permiso>
{
    public void Configure(EntityTypeBuilder<Permiso> builder)
    {
        builder.ToTable("Permisos", t => t.ExcludeFromMigrations());
        builder.HasKey(p => p.IdPermiso);
        
        builder.Property(p => p.IdPermiso).HasColumnName("IdPermiso").ValueGeneratedOnAdd();
        builder.Property(p => p.Descripcion).IsRequired().HasMaxLength(100);
    }
}
