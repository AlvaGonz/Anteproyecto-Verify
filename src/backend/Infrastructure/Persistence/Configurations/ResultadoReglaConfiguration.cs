namespace Infrastructure.Persistence.Configurations;

using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class ResultadoReglaConfiguration : IEntityTypeConfiguration<ResultadoRegla>
{
    public void Configure(EntityTypeBuilder<ResultadoRegla> builder)
    {
        builder.ToTable("ResultadosRegla");

        builder.HasKey(r => r.Id);

        builder.Property(r => r.RuleCode)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(r => r.RuleName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(r => r.Message)
            .IsRequired()
            .HasMaxLength(1000);

        builder.HasOne(r => r.Validacion)
            .WithMany(v => v.ResultadosRegla)
            .HasForeignKey(r => r.ValidacionId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
