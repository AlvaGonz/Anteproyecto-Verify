namespace Domain.Entities;

using Domain.Common;
using System.Collections.Generic;

public class ProyectoEstado : EntityBase
{
    public string CodigoUnico { get; private set; } = null!;
    public string Nombre { get; private set; } = null!;
    public string Descripcion { get; private set; } = null!;
    public string Condiciones { get; private set; } = null!;
    public string ColorHex { get; private set; } = null!;
    public bool Activo { get; private set; } = true;

    // Navegación
    public ICollection<Proyecto> Proyectos { get; private set; } = new List<Proyecto>();

    private ProyectoEstado() { } // EF Core

    public ProyectoEstado(string codigoUnico, string nombre, string descripcion, string condiciones, string colorHex)
    {
        CodigoUnico = codigoUnico;
        Nombre = nombre;
        Descripcion = descripcion;
        Condiciones = condiciones;
        ColorHex = colorHex;
        Activo = true;
    }
}
