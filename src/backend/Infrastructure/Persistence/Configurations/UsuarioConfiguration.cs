namespace Infrastructure.Persistence.Configurations;

using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class UsuarioConfiguration : IEntityTypeConfiguration<Usuario>
{
    public void Configure(EntityTypeBuilder<Usuario> builder)
    {
        builder.ToTable("Usuario"); // Removed ExcludeFromMigrations to allow additive migration
        builder.HasKey(u => u.Id);
        builder.Property(u => u.Id).HasColumnName("IdUsuario");
        builder.Property(u => u.Nombre).IsRequired().HasMaxLength(100);
        builder.Property(u => u.Apellido).IsRequired().HasMaxLength(100);
        builder.Property(u => u.NombreCompleto).HasComputedColumnSql("[Nombre] + ' ' + [Apellido]", stored: true);

        // CorreoElectronico (C# property) maps to "Email" column in the DB
        builder.Property(u => u.CorreoElectronico).HasColumnName("Email").IsRequired().HasMaxLength(200);
        builder.HasIndex(u => u.CorreoElectronico).IsUnique().HasDatabaseName("UQ_Usuario_Email");
        
        builder.Property(u => u.ContrasenaHash).IsRequired().HasMaxLength(500);
        builder.Property(u => u.Telefono).IsRequired().HasMaxLength(15);
        builder.Property(u => u.Cedula).IsRequired().HasMaxLength(15);
        builder.Property(u => u.Rol).IsRequired();
        builder.Property(u => u.Activo).IsRequired().HasDefaultValue(true);

        // Email verification fields (added to DB schema)
        builder.Property(u => u.EmailVerificado).IsRequired().HasDefaultValue(false);
        builder.Property(u => u.TokenVerificacion).HasMaxLength(4000).IsRequired(false);
        builder.Property(u => u.TokenVerificacionExpiraUtc).IsRequired(false);
        builder.Property(u => u.AvatarUrl).HasMaxLength(500).IsRequired(false);

        // Optimistic concurrency token
        builder.Property(u => u.RowVersion).IsRowVersion().IsConcurrencyToken();

        // Subscription properties
        builder.Property(u => u.PlanSuscripcionId).IsRequired(false);
        builder.Property(u => u.ConsultasUsadas).IsRequired().HasDefaultValue(0);

        builder.HasOne(u => u.Plan)
            .WithMany()
            .HasForeignKey(u => u.PlanSuscripcionId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
