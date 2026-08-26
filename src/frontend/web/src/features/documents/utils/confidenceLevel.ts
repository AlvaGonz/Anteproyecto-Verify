import { DocumentType, DocumentStatus } from "../types";
import { canonicalType } from "./documentTypes";

export const ESSENTIAL_TYPES: DocumentType[] = [
  DocumentType.CertificadoTitulo,
  DocumentType.CertificacionEstadoJuridico,
  DocumentType.PlanoMensuraCatastral,
  DocumentType.CopiaCedulaIdentidad,
  DocumentType.CertificacionIPI,
];

export const VISIBLE_ANEXO_TYPES: DocumentType[] = [
  DocumentType.CertificadoUsoSuelo,
  DocumentType.PoderNotarial,
];

export const ANEXO_TYPES: DocumentType[] = [
  DocumentType.CertificadoUsoSuelo,
  DocumentType.RegistroMercantil,
  DocumentType.PoderNotarial,
  DocumentType.RNC,
  DocumentType.CertificadoEIA,
];

export const ESSENTIAL_WEIGHT = 80;
export const ANEXO_WEIGHT = 20;

export interface DocumentLike {
  tipoDocumento: DocumentType | string | number;
  estadoDocumento?: DocumentStatus | string | number;
}

/**
 * Calculates the confidence level percentage for a set of documents.
 * 5 essential documents account for 80% (16% each).
 * 2 visible annexes account for 20% (10% each).
 * Only unique valid document types are counted.
 */
export function calculateConfidenceLevel(documents?: DocumentLike[] | null): number {
  if (!documents || documents.length === 0) return 0;

  const validDocs = documents.filter((d) => d.estadoDocumento !== DocumentStatus.Invalid);

  const uploadedEssentials = validDocs.filter((d) =>
    ESSENTIAL_TYPES.includes(canonicalType(d.tipoDocumento as DocumentType))
  );

  const uploadedAnexos = validDocs.filter((d) =>
    ANEXO_TYPES.includes(canonicalType(d.tipoDocumento as DocumentType))
  );

  const uniqueEssentialCount = new Set(
    uploadedEssentials.map((d) => canonicalType(d.tipoDocumento as DocumentType))
  ).size;

  const uniqueAnexoCount = new Set(
    uploadedAnexos.map((d) => canonicalType(d.tipoDocumento as DocumentType))
  ).size;

  const essentialPercent = ESSENTIAL_TYPES.length > 0
    ? Math.round((uniqueEssentialCount / ESSENTIAL_TYPES.length) * ESSENTIAL_WEIGHT)
    : ESSENTIAL_WEIGHT;

  const anexoPercent = VISIBLE_ANEXO_TYPES.length > 0
    ? Math.round((uniqueAnexoCount / VISIBLE_ANEXO_TYPES.length) * ANEXO_WEIGHT)
    : ANEXO_WEIGHT;

  return Math.min(100, essentialPercent + anexoPercent);
}
