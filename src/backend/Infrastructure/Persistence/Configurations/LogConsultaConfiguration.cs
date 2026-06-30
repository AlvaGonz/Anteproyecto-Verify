namespace Infrastructure.Persistence.Configurations;

using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class LogConsultaConfiguration : IEntityTypeConfiguration<LogConsulta>
{
    public void Configure(EntityTypeBuilder<LogConsulta> builder)
    {
        builder.ToTable("LogConsultas");

        builder.HasKey(e => e.Id);
        
        builder.Property(e => e.Detalle)
               .HasMaxLength(500);

        builder.HasOne(e => e.Usuario)
               .WithMany()
               .HasForeignKey(e => e.UsuarioId)
               .OnDelete(DeleteBehavior.Restrict);
               
        builder.HasIndex(e => e.UsuarioId);
        builder.HasIndex(e => e.FechaConsulta);
    }
}
