namespace Domain.Entities;

public class Acceso
{
    public int IdAcceso { get; set; }
    public int? IdPerfil { get; set; }
    public int? IdUsuario { get; set; }

    public Perfil? Perfil { get; set; }
    public UsuarioLegacy? UsuarioLegacy { get; set; }
}
