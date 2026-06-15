namespace Domain.Entities;

public class PerfilPermiso
{
    public Guid IdPerfil { get; set; }
    public Guid IdPermiso { get; set; }

    public Perfil? Perfil { get; set; }
    public Permiso? Permiso { get; set; }
}
