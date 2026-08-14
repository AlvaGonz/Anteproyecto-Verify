import { DocumentType } from "../types";

// Tipos legacy del enum backend que se mapean a su categoría canónica.
const LEGACY_TYPE_ALIASES: Partial<Record<DocumentType, DocumentType>> = {
  [DocumentType.TITLE]: DocumentType.CertificadoTitulo,
  [DocumentType.LEGAL_STATUS]: DocumentType.CertificacionEstadoJuridico,
  [DocumentType.SURVEY]: DocumentType.PlanoMensuraCatastral,
  [DocumentType.ID]: DocumentType.CopiaCedulaIdentidad,
  [DocumentType.NOTARIAL_POWER]: DocumentType.PoderNotarial,
};

export const canonicalType = (tipo: DocumentType): DocumentType => LEGACY_TYPE_ALIASES[tipo] ?? tipo;
