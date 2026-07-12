namespace Domain.Entities;

using System;
using Domain.Enums;

public class Invitacion
{
    public Guid Id { get; private set; }
    public Guid EmisorId { get; private set; }
    public string Email { get; private set; }
    public string Nombre { get; private set; }
    public string Apellido { get; private set; }
    public string Telefono { get; private set; }
    public string Cedula { get; private set; }
    public DateTime FechaInvitacion { get; private set; }
    public bool Aceptada { get; private set; }

    // Navigation property
    public virtual Usuario Emisor { get; private set; } = null!;

    protected Invitacion() 
    {
        Email = null!;
        Nombre = null!;
        Apellido = null!;
        Telefono = null!;
        Cedula = null!;
    }

    public Invitacion(Guid emisorId, string email, string nombre, string apellido, string telefono, string cedula)
    {
        Id = Guid.NewGuid();
        EmisorId = emisorId;
        Email = email;
        Nombre = nombre;
        Apellido = apellido;
        Telefono = telefono;
        Cedula = cedula;
        FechaInvitacion = DateTime.UtcNow;
        Aceptada = false;
    }

    public void Aceptar()
    {
        Aceptada = true;
    }
}
