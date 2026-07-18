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
  fileUrl: string;
}

export enum DocumentType {
  TITLE = 1,
  LEGAL_STATUS = 2,
  SURVEY = 3,
  ID = 4,
  NOTARIAL_POWER = 5,
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
  CertificadoTitulo = 21,
  CertificacionEstadoJuridico = 22,
  PlanosArquitectonicos = 23,
  PlanoMensuraCatastral = 24,
  PermisoConstruccion = 25,
  CopiaCedulaIdentidad = 26, // Adding this to match frontend needs if missing in backend
  Other = 99,
}

export enum DocumentStatus {
  Uploaded = 0,
  Processing = 1,
  Valid = 2,
  Invalid = 3,
  PreVerificado = 4,
  Observado = 5,
  Verificado = 6,
}


export interface UpdateDocumentStatusDto {
  estadoDocumento?: DocumentStatus;
  activo?: boolean;
  observaciones?: string;
}
