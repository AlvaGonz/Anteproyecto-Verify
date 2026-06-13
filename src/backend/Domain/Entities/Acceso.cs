namespace Domain.Entities;

public class Acceso
{
    public Guid IdAcceso { get; set; }
    public Guid? IdPerfil { get; set; }
    public Guid? IdUsuario { get; set; }

    public Perfil? Perfil { get; set; }
    public UsuarioLegacy? UsuarioLegacy { get; set; }
}
