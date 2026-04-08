namespace Infrastructure.Persistence.Configurations;

using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class DocumentoConfiguration : IEntityTypeConfiguration<Documento>
{
    public void Configure(EntityTypeBuilder<Documento> builder)
    {
        builder.HasKey(d => d.Id);
        builder.Property(d => d.NombreArchivoOriginal).IsRequired().HasMaxLength(500);
        builder.Property(d => d.NombreArchivoAlmacenado).IsRequired().HasMaxLength(500);
        builder.Property(d => d.RutaArchivo).IsRequired().HasMaxLength(1000);
        builder.Property(d => d.ContentType).IsRequired().HasMaxLength(100);
        builder.Property(d => d.Extension).IsRequired().HasMaxLength(10);
        builder.Property(d => d.InstitucionEmisora).HasMaxLength(200);
        builder.Property(d => d.Observaciones).HasMaxLength(1000);

        builder.HasIndex(d => d.ProyectoId);
        builder.HasIndex(d => d.Activo);
        builder.HasIndex(d => d.TipoDocumento);

        builder.HasOne(d => d.Proyecto)
            .WithMany(p => p.Documentos)
            .HasForeignKey(d => d.ProyectoId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
