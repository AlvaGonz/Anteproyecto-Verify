namespace Domain.Policies;

using System.Collections.Generic;
using System.Linq;
using Domain.Enums;

public static class RequiredDocumentsPolicy
{
    public static IEnumerable<DocumentType> GetRequiredDocumentsForCategory(int categoryId)
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

        if (categoryId == 8 || categoryId == 12 || categoryId == 7) // 8=COMERCIAL Y OFICINAS, 12=HOSPEDAJE, 7=COMBINADOS
        {
            baseDocuments.Add(DocumentType.OTHER);
        }

        return baseDocuments.Distinct();
    }
}
