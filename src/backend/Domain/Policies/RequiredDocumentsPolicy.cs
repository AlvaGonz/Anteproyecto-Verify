namespace Domain.Policies;

using System.Collections.Generic;
using System.Linq;
using Domain.Enums;

public static class RequiredDocumentsPolicy
{
    public static IEnumerable<DocumentType> GetRequiredDocumentsForCategory(ProjectCategory category)
    {
        var baseDocuments = new List<DocumentType>
        {
            DocumentType.TITLE,
            DocumentType.LEGAL_STATUS,
            DocumentType.SURVEY,
            DocumentType.ID,
            DocumentType.NOTARIAL_POWER,
            DocumentType.CertificadoTitulo,
            DocumentType.CertificacionEstadoJuridico,
            DocumentType.PlanoMensuraCatastral,
            DocumentType.PermisoConstruccion,
            DocumentType.CertificadoUsoSuelo,
            DocumentType.CertificacionIPI,
            DocumentType.RegistroMercantil,
            DocumentType.PoderNotarial,
            DocumentType.RNC,
            DocumentType.CertificacionesBancarias,
            DocumentType.NoObjecionINAPACAASD
        };

        if (category == ProjectCategory.Comercial || category == ProjectCategory.Turistico || category == ProjectCategory.Mixto)
        {
            baseDocuments.Add(DocumentType.OTHER);
            baseDocuments.Add(DocumentType.EstadosFinancieros);
            baseDocuments.Add(DocumentType.CertificadoEIA);
        }

        return baseDocuments.Distinct();
    }
}
