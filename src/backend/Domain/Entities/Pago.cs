namespace Domain.Entities;

using System.ComponentModel.DataAnnotations;

public class Pago
{
    [Key]
    public Guid IdPago { get; set; }
    public DateTime FechaPago { get; set; }
    public Guid? IdApiGobernanza { get; set; }
    public Guid? IdUsuario { get; set; }
    public Guid? Idsuscripcion { get; set; }
    public decimal Monto { get; set; }
    public Usuario? Usuario { get; set; }
    public PlanSuscripcion? PlanSuscripcion { get; set; }
}
