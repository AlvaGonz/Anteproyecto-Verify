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
          designacionCatastral: (() => {
            let val = getValue('designacionCatastral');
            if (val && typeof val === 'string') {
              const digitsOnly = val.replace(/[^0-9]/g, '');
              if (digitsOnly.length >= 4 && !val.includes(':')) {
                return digitsOnly.slice(0, -4) + ':' + digitsOnly.slice(-4);
              }
            }
            return val;
          })(),
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

    case DocumentType.PoderNotarial:
      return {
        apiDocType: 'jce',
        payload: {
          cedula: getValue('cedulaApoderado') || getValue('cedulaPoderdante') || getValue('cedula'),
          nombres: getValue('nombres'),
          apellidos: getValue('apellidos')
        }
      };

    default:
      return null; // Not supported for verification yet
  }
};

export const getValidationStatus = (
  uiValue: string | undefined | null,
  matchedData: any
): { status: 'check' | 'warning' | 'error' | null; message: string } => {
  // If matchedData is explicitly null (which happens when verification fails with 0% match), mark all as error
  if (matchedData === null) {
    return { status: 'error', message: 'No se encontraron coincidencias en la base de datos' };
  }
  
  if (matchedData === undefined) return { status: null, message: '' };
  
  const normalizedUi = String(uiValue || '').trim().toLowerCase();
  const matchedValues = Object.values(matchedData).map(v => String(v || '').trim().toLowerCase());
  
  if (normalizedUi === '') {
    return { status: 'error', message: 'Dato vacío enviado a revisión' };
  }

  if (matchedValues.includes(normalizedUi)) {
    return { status: 'check', message: 'Coincide exactamente con Gobernanza' };
  }

  const hasPartialMatch = matchedValues.some(v => v !== '' && (v.includes(normalizedUi) || normalizedUi.includes(v)));
  const hasEmptyInDb = matchedValues.includes('');

  if (hasPartialMatch || hasEmptyInDb) {
    return { status: 'warning', message: 'Coincidencia parcial o campo vacío en BD' };
  }

  return { status: 'error', message: 'Dato diferente a Gobernanza' };
};
