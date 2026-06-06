using System;

namespace Domain.Entities;

public class Pago
{
    public int IdPago { get; set; }
    public int? IdUsuario { get; set; }
    public int? IdApiGobernanza { get; set; }
    public int? Idsuscripcion { get; set; }
    public decimal Monto { get; set; }
    public DateTime FechaPago { get; set; } = DateTime.UtcNow;

    public UsuarioLegacy? UsuarioLegacy { get; set; }
    public PlanSuscripcion? PlanSuscripcion { get; set; }
}
