namespace Infrastructure.Persistence.Configurations;

using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class PlanSuscripcionConfiguration : IEntityTypeConfiguration<PlanSuscripcion>
{
    public void Configure(EntityTypeBuilder<PlanSuscripcion> builder)
    {
        builder.ToTable("PlanSuscripcion", t => t.ExcludeFromMigrations());
        builder.HasKey(p => p.Idsuscripcion);
        
        builder.Property(p => p.Idsuscripcion).HasColumnName("Idsuscripcion").ValueGeneratedOnAdd();
        builder.Property(p => p.NombrePlan).IsRequired().HasMaxLength(100);
        builder.Property(p => p.Precio).HasColumnType("decimal(10,2)");
    }
}
