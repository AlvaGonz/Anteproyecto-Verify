export enum ExtractionStatus {
  Queued = 0,
  Processing = 1,
  Completed = 2,
  Incomplete = 3,
  Failed = 4
}

export enum FieldStatus {
  Valid = 0,
  Missing = 1,
  Malformed = 2,
  LowConfidence = 3
}

export interface ExtractedField {
  rawValue: string;
  normalizedValue?: string | null;
  confidence: number;
  status: FieldStatus;
  sourcePage: number;
}

export interface CedulaRdExtractionV1 {
  schemaVersion: string;
  documentType: string;
  extractionStatus: ExtractionStatus;
  overallConfidence: number;
  cedulaNumber: ExtractedField;
  firstNames: ExtractedField;
  lastNames: ExtractedField;
  birthDate: ExtractedField;
  expiryDate: ExtractedField;
  warnings: string[];
  processorName: string;
  processorVersion: string;
}
import { z } from "zod";
import { planoMensuraExtractionSchema } from "./schemas/planoMensura.schema";
import { certificadoTituloExtractionSchema } from "./schemas/certificadoTitulo.schema";
import { estadoJuridicoExtractionSchema } from "./schemas/estadoJuridico.schema";
import { certificacionIPIExtractionSchema } from "./schemas/certificacionIPI.schema";

export type PlanoMensuraCatastralRdExtractionV1 = z.infer<typeof planoMensuraExtractionSchema>;
export type CertificadoTituloRdExtractionV1 = z.infer<typeof certificadoTituloExtractionSchema>;
export type EstadoJuridicoRdExtractionV1 = z.infer<typeof estadoJuridicoExtractionSchema>;
export type CertificacionIPIExtraction = z.infer<typeof certificacionIPIExtractionSchema>;

// Re-export geographic resolution types from schema
export type { GeographicResolutionResult } from './schemas/certificadoTitulo.schema';
export type { ResolutionAction } from './schemas/certificadoTitulo.schema';

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
  cedulaExtraction?: CedulaRdExtractionV1;
  certificadoTituloExtraction?: CertificadoTituloRdExtractionV1;
  planoMensuraExtraction?: PlanoMensuraCatastralRdExtractionV1;
  estadoJuridicoExtraction?: EstadoJuridicoRdExtractionV1;
  certificacionIPIExtraction?: CertificacionIPIExtraction;
  resultadoOcrJson?: string;
  fileUrl?: string;
}

export enum DocumentType {
  TITLE = 1,
  LEGAL_STATUS = 2,
  SURVEY = 3,
  ID = 4,
  NOTARIAL_POWER = 5,
  CertificadoUsoSuelo = 6,
  CertificacionIPI = 8,
  RegistroMercantil = 9,
  PoderNotarial = 11,
  RNC = 12,
  CertificadoTitulo = 21,
  CertificacionEstadoJuridico = 22,
  PlanoMensuraCatastral = 24,
  CopiaCedulaIdentidad = 26, // Adding this to match frontend needs if missing in backend
  CertificadoEIA = 29,
  Other = 99,
}

export enum DocumentStatus {
  Uploaded = 0,
  Processing = 1,
  Valid = 2,
  Invalid = 3,
  EnRevision = 4,
  Observado = 5,
  Verificado = 6,
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
