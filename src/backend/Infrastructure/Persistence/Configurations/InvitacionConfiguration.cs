namespace Infrastructure.Persistence.Configurations;

using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class InvitacionConfiguration : IEntityTypeConfiguration<Invitacion>
{
    public void Configure(EntityTypeBuilder<Invitacion> builder)
    {
        builder.ToTable("Invitaciones");
        
        builder.HasKey(i => i.Id);
        
        builder.Property(i => i.Email).IsRequired().HasMaxLength(200);
        builder.Property(i => i.Nombre).IsRequired().HasMaxLength(100);
        builder.Property(i => i.Apellido).IsRequired().HasMaxLength(100);
        builder.Property(i => i.Telefono).IsRequired().HasMaxLength(15);
        builder.Property(i => i.Cedula).IsRequired().HasMaxLength(15);
        builder.Property(i => i.FechaInvitacion).IsRequired();
        builder.Property(i => i.Aceptada).IsRequired().HasDefaultValue(false);

        // Relationships
        builder.HasOne(i => i.Emisor)
            .WithMany() // Assuming Emisor (Usuario) doesn't explicitly navigate to Invitaciones yet, or we can add it later if needed
            .HasForeignKey(i => i.EmisorId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
