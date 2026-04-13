export interface DocumentDto {
  id: string;
  proyectoId: string;
  tipoDocumento: DocumentType;
  nombreArchivoOriginal: string;
  contentType: string;
  extension: string;
  tamanoBytes: number;
  estadoDocumento: DocumentStatus;
  activo: boolean;
  version: number;
  fechaEmision?: string;
  institucionEmisora?: string;
  usuarioCargaId: string;
  observaciones?: string;
  createdAtUtc: string;
  updatedAtUtc?: string;
}

export enum DocumentType {
  CertificadoTitulo = 1,
  CertificacionEstadoJuridico = 2,
  PlanosArquitectonicos = 3,
  PlanoMensuraCatastral = 4,
  PermisoConstruccion = 5,
  CertificadoUsoSuelo = 6,
  FormularioFIDVB009 = 7,
  CertificacionIPI = 8,
  RegistroMercantil = 9,
  ActaConstitutiva = 10,
  PoderNotarial = 11,
  RNC = 12,
  EstadosFinancieros = 13,
  CertificacionesBancarias = 14,
  FormularioKYCAML = 15,
  DeclaracionPEP = 16,
  CertificadoEIA = 17,
  NoObjecionINAPACAASD = 18,
  DocumentosNotariales = 19,
  DocumentosSupletorios = 20,
  ActodeVenta = 21,
  CopiaCedulaIdentidad = 22,
  Other = 99,
}

export enum DocumentStatus {
  Uploaded = 0,
  Processing = 1,
  Valid = 2,
  Invalid = 3,
}

export interface UploadDocumentDto {
  tipoDocumento: DocumentType;
  fechaEmision?: string;
  institucionEmisora?: string;
  observaciones?: string;
}

export interface UpdateDocumentStatusDto {
  estadoDocumento?: DocumentStatus;
  activo?: boolean;
  observaciones?: string;
}
