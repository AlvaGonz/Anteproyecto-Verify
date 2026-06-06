namespace Domain.Entities;

public class PerfilPermiso
{
    public int IdPerfil { get; set; }
    public int IdPermiso { get; set; }

    public Perfil? Perfil { get; set; }
    public Permiso? Permiso { get; set; }
}
