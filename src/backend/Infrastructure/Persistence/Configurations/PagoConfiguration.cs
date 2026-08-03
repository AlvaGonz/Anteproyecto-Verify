namespace Infrastructure.Persistence.Configurations;

using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class PagoConfiguration : IEntityTypeConfiguration<Pago>
{
    public void Configure(EntityTypeBuilder<Pago> builder)
    {
        builder.ToTable("Pagos");
        builder.HasKey(p => p.IdPago);

        builder.Property(p => p.IdPago).HasColumnName("IdPago").ValueGeneratedOnAdd();
        builder.Property(p => p.IdUsuario).HasColumnName("IdUsuario");
        builder.Property(p => p.IdApiGobernanza).HasColumnName("IdApiGobernanza");
        builder.Property(p => p.Idsuscripcion).HasColumnName("Idsuscripcion");
        builder.Property(p => p.Monto).HasColumnType("decimal(10,2)");
        builder.Property(p => p.FechaPago).HasDefaultValueSql("GETDATE()");

        builder.HasOne(p => p.UsuarioLegacy)
            .WithMany(ul => ul.Pagos)
            .HasForeignKey(p => p.IdUsuario)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(p => p.PlanSuscripcion)
            .WithMany()
            .HasForeignKey(p => p.Idsuscripcion)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
