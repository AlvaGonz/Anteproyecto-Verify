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
    case DocumentType.CertificacionEstadoJuridico:
    case DocumentType.LEGAL_STATUS:
    case DocumentType.PlanoMensuraCatastral:
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
          fechaInscripcion: getValue('fechaYHoraInscripcion') || getValue('fechaInscripcion'),
          fechaEmision: getValue('fechaHoraInscripcion') || getValue('fechaEmision'),
          vieneDe: getValue('vieneDe'),
          superficieM2: getValue('superficieMetrosCuadrados') || getValue('superficieM2'),
          provincia: getValue('provincia'),
          municipio: getValue('municipio'),
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
  matchedData: any,
  fieldName?: string,
  failedFields?: string[]
): { status: 'check' | 'warning' | 'error' | null; message: string } => {
  if (matchedData === null) {
    return { status: 'error', message: '' };
  }
  
  if (matchedData === undefined) return { status: null, message: '' };

  const nameMap: Record<string, string> = {
      'fechaYHoraInscripcion': 'FechaInscripcion',
      'fechaHoraInscripcion': 'FechaEmision',
      'superficieM2': 'Superficie',
      'superficieMetrosCuadrados': 'Superficie',
      'superficieARegistrarParcelaM2': 'Superficie',
      'vieneDe': 'VieneDe',
      'designacionCatastral': 'CodigoDesignacionCatastral',
      'designacionCatastralPosicional': 'DesigCatastralPosicional',
      'designacionCatastralOrigen': 'DesignCatastralOrigen',
      'cedulaNumber': 'Cedula',
      'firstNames': 'Nombres',
      'lastNames': 'Apellidos',
      'birthDate': 'FechaNacimiento',
      'expiryDate': 'FechaExpiracion',
      'numeroCertificacion': 'NoCertificacion',
      'numeroInmueble': 'NoInmueble',
      'parcelaNumero': 'ParcelaNo',
      'matricula': 'Matricula',
      'oficina': 'Oficina',
      'municipio': 'Municipio',
      'provincia': 'Provincia'
  };

  const normalize = (val: any) =>
    String(val || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[,\.:\s]/g, '')
      .toLowerCase();

  // If backend provided failedFields list, it is the authoritative validation source
  if (fieldName && failedFields) {
    const mappedName = nameMap[fieldName] || fieldName;
    const isFailed = failedFields.some(
      f => f.toLowerCase() === mappedName.toLowerCase() ||
           f.toLowerCase() === fieldName.toLowerCase() ||
           (fieldName === 'designacionCatastral' && f.toLowerCase() === 'designacioncatastral') ||
           (fieldName === 'superficieM2' && f.toLowerCase() === 'superficie')
    );
    
    if (isFailed) {
      return { status: 'error', message: '' };
    }
    return { status: 'check', message: '' };
  }

  const normalizedUi = normalize(uiValue);
  if (normalizedUi === '') {
    return { status: 'error', message: '' };
  }

  // If we know the field name, we compare directly with that field in the DB.
  if (fieldName) {
    const mappedName = nameMap[fieldName] || fieldName;
    const actualKey = Object.keys(matchedData).find(
      k => k.toLowerCase() === mappedName.toLowerCase() || k.toLowerCase() === fieldName.toLowerCase()
    );
    
    if (actualKey) {
      const dbValue = normalize(matchedData[actualKey]);
      if (dbValue === normalizedUi || (dbValue !== '' && (dbValue.includes(normalizedUi) || normalizedUi.includes(dbValue)))) {
        return { status: 'check', message: '' };
      }
      return { status: 'error', message: '' };
    }
  }

  return { status: 'check', message: '' };
};
