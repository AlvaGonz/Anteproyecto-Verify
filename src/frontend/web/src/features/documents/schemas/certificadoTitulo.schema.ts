import { z } from 'zod';

const ResolutionActionEnum = z.enum(['AutoApply', 'Review', 'Ignore']);
export type ResolutionAction = z.infer<typeof ResolutionActionEnum>;
export const ResolutionAction = {
  AutoApply: 'AutoApply' as const,
  Review: 'Review' as const,
  Ignore: 'Ignore' as const
} as const;

const extractedFieldSchema = z.object({
  rawValue: z.string(),
  normalizedValue: z.string().nullable().optional(),
  confidence: z.number(),
  status: z.number(),
  sourcePage: z.number()
});

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

export const certificadoTituloExtractionSchema = z.object({
  schemaVersion: z.string(),
  documentType: z.string(),
  extractionStatus: z.number(),
  overallConfidence: z.number(),
  oficina: extractedFieldSchema,
  designacionCatastral: extractedFieldSchema,
  fechaYHoraInscripcion: extractedFieldSchema,
  vieneDe: extractedFieldSchema,
  matricula: extractedFieldSchema,
  municipio: extractedFieldSchema,
  provincia: extractedFieldSchema,
  superficieM2: extractedFieldSchema,
  warnings: z.array(z.string()),
  processorName: z.string(),
  processorVersion: z.string(),
  provinceResolution: geographicResolutionSchema.optional().nullable(),
  municipalityResolution: geographicResolutionSchema.optional().nullable()
});

export type CertificadoTituloExtraction = z.infer<typeof certificadoTituloExtractionSchema>;
