import { z } from "zod";
import { ExtractionStatus } from "../types";
import { extractedFieldSchema } from "./planoMensura.schema";

const ResolutionActionEnum = z.enum(['AutoApply', 'Review', 'Ignore']);
export type ResolutionAction = z.infer<typeof ResolutionActionEnum>;
export const ResolutionAction = {
  AutoApply: 'AutoApply' as const,
  Review: 'Review' as const,
  Ignore: 'Ignore' as const
} as const;

const geographicResolutionSchema = z.object({
  rawValue: z.string(),
  normalizedValue: z.string(),
  resolvedId: z.string().nullable().optional(),
  resolvedCode: z.string().nullable().optional(),
  resolvedName: z.string().nullable().optional(),
  resolutionMethod: z.enum(['exact', 'alias', 'fuzzy', 'unresolved']),
  confidence: z.number(),
  aliasesMatched: z.array(z.string()),
  warnings: z.array(z.string()),
  suggestedAction: ResolutionActionEnum
});

export type GeographicResolutionResult = z.infer<typeof geographicResolutionSchema>;

export const estadoJuridicoExtractionSchema = z.object({
  schemaVersion: z.string(),
  documentType: z.string(),
  extractionStatus: z.nativeEnum(ExtractionStatus),
  overallConfidence: z.number(),
  warnings: z.array(z.string()),
  processorName: z.string(),
  processorVersion: z.string(),
  
  matricula: extractedFieldSchema,
  fechaHoraInscripcion: extractedFieldSchema,
  oficina: extractedFieldSchema,
  municipio: extractedFieldSchema,
  provincia: extractedFieldSchema,
  superficieMetrosCuadrados: extractedFieldSchema,
  designacionCatastral: extractedFieldSchema,
  vieneDe: extractedFieldSchema,
  declaracionEstadoLegal: extractedFieldSchema,
  provinceResolution: geographicResolutionSchema.optional().nullable(),
  municipalityResolution: geographicResolutionSchema.optional().nullable()
});
