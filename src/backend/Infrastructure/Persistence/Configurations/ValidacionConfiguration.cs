namespace Infrastructure.Persistence.Configurations;

using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class ValidacionConfiguration : IEntityTypeConfiguration<Validacion>
{
    public void Configure(EntityTypeBuilder<Validacion> builder)
    {
        builder.HasKey(v => v.Id);
        builder.Property(v => v.FuenteValidacion).IsRequired().HasMaxLength(200);
        builder.Property(v => v.Detalle).HasMaxLength(2000);

        builder.OwnsMany(v => v.DatosValidados, a => 
        {
            a.WithOwner().HasForeignKey("ValidacionId");
            a.Property<int>("Id");
            a.HasKey("Id");
        });

        builder.HasOne(v => v.Sello)
            .WithMany()
            .HasForeignKey(v => v.SelloId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(v => v.Proyecto)
            .WithMany(p => p.Validaciones)
            .HasForeignKey(v => v.ProyectoId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(v => v.Documento)
            .WithMany(d => d.Validaciones)
            .HasForeignKey(v => v.DocumentoId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
