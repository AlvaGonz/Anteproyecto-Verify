namespace Domain.Entities;

public class UsuarioLegacy
{
    public Guid IdUsuario { get; set; }
    public string Nombre { get; set; } = null!;
    public string Apellido { get; set; } = null!;
    public string NombreCompleto { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string ContrasenaHash { get; set; } = null!;
    public string Telefono { get; set; } = null!;
    public string Cedula { get; set; } = null!;
}
