using System;

namespace Domain.Entities;

public class Pago
{
    public Guid IdPago { get; set; }
    public Guid? IdUsuario { get; set; }
    public Guid? IdApiGobernanza { get; set; }
    public Guid? Idsuscripcion { get; set; }
    public decimal Monto { get; set; }
    public DateTime FechaPago { get; set; } = DateTime.UtcNow;

    public UsuarioLegacy? UsuarioLegacy { get; set; }
    public PlanSuscripcion? PlanSuscripcion { get; set; }
}
