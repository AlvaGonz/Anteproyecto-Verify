using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations;

public class JCE_CiudadanoConfiguration : IEntityTypeConfiguration<JCE_Ciudadano>
{
    public void Configure(EntityTypeBuilder<JCE_Ciudadano> builder)
    {
        builder.ToTable("JCE_Ciudadano");
        builder.HasKey(j => j.Cedula);
    }
}
