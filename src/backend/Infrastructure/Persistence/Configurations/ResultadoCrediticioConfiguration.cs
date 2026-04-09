namespace Infrastructure.Persistence.Configurations;

using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class ResultadoCrediticioConfiguration : IEntityTypeConfiguration<ResultadoCrediticio>
{
    public void Configure(EntityTypeBuilder<ResultadoCrediticio> builder)
    {
        builder.ToTable("ResultadosCrediticios");

        builder.HasKey(r => r.Id);

        builder.Property(r => r.PorcentajeEndeudamiento)
            .HasColumnType("decimal(5,2)");

        builder.HasOne(r => r.Proyecto)
            .WithMany()
            .HasForeignKey(r => r.ProyectoId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(r => r.Consentimiento)
            .WithMany()
            .HasForeignKey(r => r.ConsentimientoId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
