namespace Domain.Entities;

public class TipoNotificacion
{
    public int Id { get; private set; }
    public string Codigo { get; private set; } = null!;
    public string Nombre { get; private set; } = null!;
    public string? Descripcion { get; private set; }
    public string Categoria { get; private set; } = null!;
    public byte Prioridad { get; private set; } = 3;
    public string Canales { get; private set; } = "InApp";
    public string? PlantillaTitulo { get; private set; }
    public string? PlantillaMensaje { get; private set; }
    public DateTime CreatedAtUtc { get; private set; } = DateTime.UtcNow;

    private TipoNotificacion() { }

    public TipoNotificacion(
        string codigo,
        string nombre,
        string categoria,
        byte prioridad,
        string canales,
        string? descripcion = null,
        string? plantillaTitulo = null,
        string? plantillaMensaje = null)
    {
        Codigo = codigo;
        Nombre = nombre;
        Categoria = categoria;
        Prioridad = prioridad;
        Canales = canales;
        Descripcion = descripcion;
        PlantillaTitulo = plantillaTitulo;
        PlantillaMensaje = plantillaMensaje;
    }
}
