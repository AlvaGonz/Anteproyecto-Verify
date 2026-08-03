namespace Infrastructure.Persistence.Configurations;

using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class AuditoriaConfiguration : IEntityTypeConfiguration<Auditoria>
{
    public void Configure(EntityTypeBuilder<Auditoria> builder)
    {
        builder.HasKey(a => a.Id);
        builder.Property(a => a.Accion).IsRequired().HasMaxLength(200);
        builder.Property(a => a.Detalle).HasMaxLength(2000);
        builder.Property(a => a.Resultado).HasMaxLength(2000);
        builder.Property(a => a.IpOrigen).HasMaxLength(50);
        builder.Property(a => a.TipoOperacion).IsRequired();

        builder.ToTable(tb => tb.HasTrigger("trg_Auditoria_AppendOnly"));

        builder.HasOne(a => a.Usuario)
            .WithMany()
            .HasForeignKey(a => a.UsuarioId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(a => a.Proyecto)
            .WithMany(p => p.Auditorias)
            .HasForeignKey(a => a.ProyectoId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(a => a.EstadoAnterior)
            .WithMany()
            .HasForeignKey(a => a.EstadoAnteriorId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(a => a.EstadoNuevo)
            .WithMany()
            .HasForeignKey(a => a.EstadoNuevoId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
