using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations;

public class CatastroTituloConfiguration : IEntityTypeConfiguration<CatastroTitulo>
{
    public void Configure(EntityTypeBuilder<CatastroTitulo> builder)
    {
        builder.ToTable("CatastroTitulo");
        builder.HasKey(c => c.IdCatastroTitulo);
    }
}
