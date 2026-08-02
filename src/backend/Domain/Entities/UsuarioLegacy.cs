namespace Domain.Entities;

using System.ComponentModel.DataAnnotations;

public class UsuarioLegacy
{
    [Key]
    public Guid IdUsuario { get; set; }
    public string Apellido { get; set; } = string.Empty;
    public string Cedula { get; set; } = string.Empty;
    public string ContrasenaHash { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string NombreCompleto { get; set; } = string.Empty;
    public string? Telefono { get; set; }
    public ICollection<Pago> Pagos { get; set; } = new List<Pago>();
}
