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
  resultadoOcrJson?: string;
}

export enum DocumentType {
  TITLE = "TITLE",
  LEGAL_STATUS = "LEGAL_STATUS",
  SURVEY = "SURVEY",
  ID = "ID",
  NOTARIAL_POWER = "NOTARIAL_POWER",
  CertificadoUsoSuelo = "CertificadoUsoSuelo",
  FormularioFIDVB009 = "FormularioFIDVB009",
  CertificacionIPI = "CertificacionIPI",
  RegistroMercantil = "RegistroMercantil",
  ActaConstitutiva = "ActaConstitutiva",
  PoderNotarial = "PoderNotarial",
  RNC = "RNC",
  EstadosFinancieros = "EstadosFinancieros",
  CertificacionesBancarias = "CertificacionesBancarias",
  FormularioKYCAML = "FormularioKYCAML",
  DeclaracionPEP = "DeclaracionPEP",
  CertificadoEIA = "CertificadoEIA",
  NoObjecionINAPACAASD = "NoObjecionINAPACAASD",
  DocumentosNotariales = "DocumentosNotariales",
  DocumentosSupletorios = "DocumentosSupletorios",
  CertificadoTitulo = "CertificadoTitulo",
  CertificacionEstadoJuridico = "CertificacionEstadoJuridico",
  PlanosArquitectonicos = "PlanosArquitectonicos",
  PlanoMensuraCatastral = "PlanoMensuraCatastral",
  PermisoConstruccion = "PermisoConstruccion",
  CopiaCedulaIdentidad = "CopiaCedulaIdentidad", // Adding this to match frontend needs if missing in backend
  Other = "OTHER",
}

export enum DocumentStatus {
  Uploaded = "Uploaded",
  Processing = "Processing",
  Valid = "Valid",
  Invalid = "Invalid",
  EnRevision = "EnRevision",
  Observado = "Observado",
  Verificado = "Verificado",
}


export interface UpdateDocumentStatusDto {
  estadoDocumento?: DocumentStatus;
  activo?: boolean;
  observaciones?: string;
}

export enum OcrFieldReviewState {
  Unreviewed = 0,
  Confirmed = 1,
  Corrected = 2,
  Absent = 3
}

export interface OcrField {
  name: string;
  value: string;
  confidence: number;
  reviewState: OcrFieldReviewState;
  correctedValue?: string;
}

export interface OcrResult {
  success: boolean;
  provider: string;
  confidenceScore: number;
  fields: Record<string, OcrField>;
  error?: string;
}

export interface UpdateDocumentFieldReviewDto {
  reviewState: OcrFieldReviewState;
  correctedValue?: string;
}
