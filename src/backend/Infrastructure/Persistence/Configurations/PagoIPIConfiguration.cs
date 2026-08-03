using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations;

public class PagoIPIConfiguration : IEntityTypeConfiguration<PagoIPI>
{
    public void Configure(EntityTypeBuilder<PagoIPI> builder)
    {
        builder.ToTable("PagoIPI");
        builder.HasKey(p => p.Rnc);
    }
}
