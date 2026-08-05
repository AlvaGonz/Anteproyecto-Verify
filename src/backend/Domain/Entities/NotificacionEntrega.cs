namespace Domain.Entities;

public class NotificacionEntrega
{
    public Guid Id { get; private set; } = Guid.NewGuid();
    public Guid NotificacionId { get; private set; }
    public string Canal { get; private set; } = null!;
    public string Estado { get; private set; } = "Pendiente";
    public DateTime? FechaEnvio { get; private set; }
    public DateTime? FechaLectura { get; private set; }
    public string? ErrorMensaje { get; private set; }
    public int Reintentos { get; private set; }
    public DateTime CreatedAtUtc { get; private set; } = DateTime.UtcNow;

    public Notificacion Notificacion { get; private set; } = null!;

    private NotificacionEntrega() { }

    public NotificacionEntrega(Guid notificacionId, string canal)
    {
        NotificacionId = notificacionId;
        Canal = canal;
        Estado = "Pendiente";
        Reintentos = 0;
    }

    public void MarcarEnviado()
    {
        Estado = "Enviado";
        FechaEnvio = DateTime.UtcNow;
    }

    public void MarcarFallido(string error)
    {
        Estado = "Fallido";
        FechaEnvio = DateTime.UtcNow;
        ErrorMensaje = error;
        Reintentos++;
    }

    public void MarcarLeido()
    {
        if (Estado != "Leido")
        {
            Estado = "Leido";
            FechaLectura = DateTime.UtcNow;
        }
    }
}
