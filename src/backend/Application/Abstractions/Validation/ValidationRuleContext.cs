namespace Application.Abstractions.Validation;

using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Domain.Entities;

public class ValidationRuleContext
{
    public Proyecto Proyecto { get; }
    public IReadOnlyList<Documento> Documentos { get; }

    public ValidationRuleContext(Proyecto proyecto, IReadOnlyList<Documento> documentos)
    {
        Proyecto = proyecto;
        Documentos = documentos;
    }
}
