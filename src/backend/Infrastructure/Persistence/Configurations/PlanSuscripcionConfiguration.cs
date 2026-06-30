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
        builder.Property(p => p.MaxUsuariosSecundarios).IsRequired().HasDefaultValue(0);
        builder.Property(p => p.MaxAlmacenamientoMb).IsRequired().HasDefaultValue(0);
        builder.Property(p => p.AlertasTiempoRealDisponible).IsRequired().HasDefaultValue(false);
        builder.Property(p => p.ModeloLmDisponible).IsRequired().HasDefaultValue(false);
        builder.Property(p => p.ValidacionLoteDisponible).IsRequired().HasDefaultValue(false);
        builder.Property(p => p.ExportacionExcelDisponible).IsRequired().HasDefaultValue(false);
        builder.Property(p => p.ExportacionPdfDisponible).IsRequired().HasDefaultValue(false);
        builder.Property(p => p.IntegracionCrmDisponible).IsRequired().HasDefaultValue(false);
        builder.Property(p => p.SoporteTipo).IsRequired().HasMaxLength(50).HasDefaultValue("Comunidad");
        builder.Property(p => p.AccesoApi).IsRequired().HasDefaultValue(false);
    }
}
