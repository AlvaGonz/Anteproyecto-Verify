import { z } from 'zod';

const extractedFieldSchema = z.object({
  rawValue: z.string(),
  normalizedValue: z.string().nullable().optional(),
  confidence: z.number(),
  status: z.number(),
  sourcePage: z.number()
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
  processorVersion: z.string()
});

export type CertificadoTituloExtraction = z.infer<typeof certificadoTituloExtractionSchema>;
