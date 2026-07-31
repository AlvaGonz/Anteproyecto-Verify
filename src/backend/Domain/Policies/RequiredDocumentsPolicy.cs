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
            DocumentType.CertificadoUsoSuelo,
            DocumentType.CertificacionIPI,
            DocumentType.RegistroMercantil,
            DocumentType.PoderNotarial,
            DocumentType.RNC
        };

        if (category == ProjectCategory.Comercial || category == ProjectCategory.Turistico || category == ProjectCategory.Mixto)
        {
            baseDocuments.Add(DocumentType.OTHER);
        }

        return baseDocuments.Distinct();
    }
}
