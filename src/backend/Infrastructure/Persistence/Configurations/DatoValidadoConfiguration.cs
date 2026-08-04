namespace Infrastructure.Persistence.Configurations;

using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class DatoValidadoConfiguration : IEntityTypeConfiguration<DatoValidado>
{
    public void Configure(EntityTypeBuilder<DatoValidado> builder)
    {
        builder.ToTable("DatoValidado");
        
        builder.HasKey(d => d.Id);
        
        builder.Property(d => d.TipoDocumento)
            .IsRequired()
            .HasMaxLength(100);

        // Store JSON as strings in DB
        builder.Property(d => d.DatosOcrJson)
            .IsRequired()
            .HasColumnType("nvarchar(max)");
            
        builder.Property(d => d.DatosMatchJson)
            .IsRequired()
            .HasColumnType("nvarchar(max)");

        builder.HasOne(d => d.Proyecto)
            .WithMany()
            .HasForeignKey(d => d.ProyectoId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(d => d.Documento)
            .WithMany()
            .HasForeignKey(d => d.DocumentoId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
