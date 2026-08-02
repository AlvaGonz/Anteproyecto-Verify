import { DocumentDto, DocumentType } from '../../documents/types';
import { VerificationPayload, DocumentTypeGobernanza } from '../types';

export const mapDocumentToVerificationPayload = (
  document: DocumentDto, 
  fields: any[]
): { payload: VerificationPayload; apiDocType: DocumentTypeGobernanza } | null => {
  
  // Helper to extract value from fields array (or use correctedValue)
  const getValue = (fieldName: string) => {
    const field = fields.find(f => f.name === fieldName);
    if (!field) return undefined;
    return field.correctedValue || field.value || undefined;
  };

  switch (document.tipoDocumento) {
    case DocumentType.CertificadoTitulo:
    case DocumentType.TITLE:
      return {
        apiDocType: 'catastro',
        payload: {
          matricula: getValue('matricula'),
          designacionCatastral: getValue('designacionCatastral'),
          oficina: getValue('oficina'),
          fechaInscripcion: getValue('fechaYHoraInscripcion'),
          fechaEmision: getValue('fechaEmision'),
          vieneDe: getValue('vieneDe'),
          designCatastralOrigen: getValue('designCatastralOrigen'),
          desigCatastralPosicional: getValue('desigCatastralPosicional'),
        }
      };

    case DocumentType.CopiaCedulaIdentidad:
    case DocumentType.ID:
      return {
        apiDocType: 'jce',
        payload: {
          cedula: getValue('cedula'),
          nombres: getValue('nombres'),
          apellidos: getValue('apellidos'),
          fechaNacimiento: getValue('fechaNacimiento'),
          fechaExpiracion: getValue('fechaExpiracion')
        }
      };

    case DocumentType.CertificacionIPI:
      return {
        apiDocType: 'pagoipi',
        payload: {
          rnc: getValue('rnc'),
          noCertificacion: getValue('noCertificacion'),
          noInmueble: getValue('noInmueble'),
          parcelaNo: getValue('parcelaNo')
        }
      };
      
    case DocumentType.CertificadoUsoSuelo:
      return {
        apiDocType: 'permisosuelo',
        payload: {
          numeroPermiso: getValue('numeroPermiso'),
          numeroExpediente: getValue('numeroExpediente'),
          rnc: getValue('rnc'),
          departamento: getValue('departamento'),
          operacion: getValue('operacion'),
          seccion: getValue('seccion'),
          lugar: getValue('lugar')
        }
      };

    case DocumentType.RNC:
      return {
        apiDocType: 'dgii',
        payload: {
          rnc: getValue('rnc'),
          nombreRazonSocial: getValue('nombreRazonSocial'),
          actividadEconomica: getValue('actividadEconomica')
        }
      };

    default:
      return null; // Not supported for verification yet
  }
};
