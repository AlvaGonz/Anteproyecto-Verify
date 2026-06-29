namespace Infrastructure.Persistence.Configurations;

using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class PlanSuscripcionConfiguration : IEntityTypeConfiguration<PlanSuscripcion>
{
    public void Configure(EntityTypeBuilder<PlanSuscripcion> builder)
    {
        builder.ToTable("PlanSuscripcion"); // Removed ExcludeFromMigrations to allow additive migration
        builder.HasKey(p => p.Idsuscripcion);
        
        builder.Property(p => p.Idsuscripcion).HasColumnName("Idsuscripcion").ValueGeneratedOnAdd();
        builder.Property(p => p.NombrePlan).IsRequired().HasMaxLength(100);
        builder.Property(p => p.Precio).HasColumnType("decimal(10,2)");

        builder.Property(p => p.MaxConsultas).IsRequired().HasDefaultValue(0);
        builder.Property(p => p.MaxProyectos).IsRequired().HasDefaultValue(0);
        builder.Property(p => p.PresentacionPublica).IsRequired().HasDefaultValue(false);
        builder.Property(p => p.QrIncluido).IsRequired().HasDefaultValue(false);
        builder.Property(p => p.MultiUsuario).IsRequired().HasDefaultValue(false);
        builder.Property(p => p.AccesoApi).IsRequired().HasDefaultValue(false);
    }
}
