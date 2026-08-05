export interface GobernanzaVerificationResponse {
  isValid: boolean;
  matchPercentage: number;
  message: string;
  matchedData: any;
}

export type DocumentTypeGobernanza = 
  | 'catastro' 
  | 'jce' 
  | 'dgii' 
  | 'licenciaconstruccion' 
  | 'permisosuelo' 
  | 'pagoipi';

export interface BaseVerificationRequest {
  proyectoId?: string;
  documentoId?: string;
  tipoDocumento?: string;
}

export interface CatastroVerificationRequest extends BaseVerificationRequest {
  matricula?: string;
  designacionCatastral?: string;
  oficina?: string;
  fechaInscripcion?: string;
  fechaEmision?: string;
  vieneDe?: string;
  designCatastralOrigen?: string;
  desigCatastralPosicional?: string;
}

export interface JceVerificationRequest extends BaseVerificationRequest {
  cedula?: string;
  nombres?: string;
  apellidos?: string;
  fechaNacimiento?: string;
  fechaExpiracion?: string;
}

export interface IpiVerificationRequest extends BaseVerificationRequest {
  rnc?: string;
  noCertificacion?: string;
  noInmueble?: string;
  parcelaNo?: string;
}

export interface PermisoSueloVerificationRequest extends BaseVerificationRequest {
  numeroPermiso?: string;
  numeroExpediente?: string;
  rnc?: string;
  departamento?: string;
  operacion?: string;
  seccion?: string;
  lugar?: string;
}

export interface DgiiVerificationRequest extends BaseVerificationRequest {
  rnc?: string;
  nombreRazonSocial?: string;
  actividadEconomica?: string;
}

// Union of all possible requests based on document type
export type VerificationPayload = 
  | CatastroVerificationRequest 
  | JceVerificationRequest 
  | IpiVerificationRequest 
  | PermisoSueloVerificationRequest 
  | DgiiVerificationRequest 
  | Record<string, any>;
