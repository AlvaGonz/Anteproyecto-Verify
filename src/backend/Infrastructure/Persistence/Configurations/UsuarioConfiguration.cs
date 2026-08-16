namespace Infrastructure.Persistence.Configurations;

using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class UsuarioConfiguration : IEntityTypeConfiguration<Usuario>
{
    public void Configure(EntityTypeBuilder<Usuario> builder)
    {
        builder.ToTable("Usuario", t => t.HasCheckConstraint("CK_Usuario_Cedula_Rnc", "([Cedula] IS NOT NULL AND [Cedula] <> '') OR ([Rnc] IS NOT NULL AND [Rnc] <> '')")); // Removed ExcludeFromMigrations to allow additive migration
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
        builder.Property(u => u.Cedula).IsRequired(false).HasMaxLength(15);
        builder.Property(u => u.Rol).IsRequired();
        builder.Property(u => u.Activo).IsRequired().HasDefaultValue(true);

        // Email verification fields (added to DB schema)
        builder.Property(u => u.EmailVerificado).IsRequired().HasDefaultValue(false);
        builder.Property(u => u.TokenVerificacion).HasMaxLength(4000).IsRequired(false);
        builder.Property(u => u.TokenVerificacionExpiraUtc).IsRequired(false);
        builder.Property(u => u.AvatarUrl).IsRequired(false);
        builder.Property(u => u.SocialLogin).IsRequired().HasDefaultValue(false);
        builder.Property(u => u.GoogleId).HasMaxLength(100).IsRequired(false);
        builder.Property(u => u.AceptoDescargo).IsRequired().HasDefaultValue(false);

        // Optimistic concurrency token
        builder.Property(u => u.RowVersion).IsRowVersion().IsConcurrencyToken();

        // Subscription properties
        builder.Property(u => u.PlanSuscripcionId).IsRequired(false);
        builder.Property(u => u.ConsultasUsadas).IsRequired().HasDefaultValue(0);
        builder.Property(u => u.ProyectosCreados).IsRequired().HasDefaultValue(0);

        builder.Property(u => u.MaxProyectosDelegados).IsRequired(false);
        builder.Property(u => u.MaxConsultasDelegadas).IsRequired(false);

        builder.HasOne(u => u.Plan)
            .WithMany()
            .HasForeignKey(u => u.PlanSuscripcionId)
            .OnDelete(DeleteBehavior.SetNull);

        // Profile extension fields
        builder.Property(u => u.Direccion).HasMaxLength(200).IsRequired(false);
        builder.Property(u => u.Provincia).HasMaxLength(50).IsRequired(false);
        builder.Property(u => u.Nickname).HasMaxLength(30).IsRequired(false);
        builder.HasIndex(u => u.Nickname).IsUnique().HasDatabaseName("UQ_Usuario_Nickname").HasFilter("[Nickname] IS NOT NULL");

        // Public presentation preferences (persisted as enum names, no magic strings)
        builder.Property(u => u.NombrePublicoModo).HasConversion<string>().HasMaxLength(20).IsRequired(false);
        builder.Property(u => u.IdentificacionPublicaModo).HasConversion<string>().HasMaxLength(20).IsRequired(false);

        // Team properties
        builder.Property(u => u.TitularId).IsRequired(false);

        builder.HasOne(u => u.Titular)
            .WithMany(u => u.MiembrosEquipo)
            .HasForeignKey(u => u.TitularId)
            .OnDelete(DeleteBehavior.Restrict);

        // Two-Factor Authentication columns (additive migration)
        builder.Property(u => u.TwoFactorEnabled).IsRequired().HasDefaultValue(false);
        builder.Property(u => u.TwoFactorSecretEncrypted).HasMaxLength(500).IsRequired(false);
        builder.Property(u => u.RecoveryCodesHashJson).HasMaxLength(2000).IsRequired(false);
        builder.Property(u => u.Failed2FAAttempts).IsRequired().HasDefaultValue(0);
        builder.Property(u => u.Lockout2FAUntilUtc).IsRequired(false);
        builder.Property(u => u.Last2FAVerifiedUtc).IsRequired(false);
        builder.Property(u => u.EmailOtpLastSentUtc).IsRequired(false);
    }
}
