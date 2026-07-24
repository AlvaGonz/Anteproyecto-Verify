import { z } from "zod";
import { ExtractionStatus, FieldStatus } from "../types";

export const extractedFieldSchema = z.object({
  rawValue: z.string(),
  normalizedValue: z.string(),
  confidence: z.number(),
  status: z.nativeEnum(FieldStatus),
  sourcePage: z.number()
});

export const planoMensuraExtractionSchema = z.object({
  schemaVersion: z.string(),
  documentType: z.string(),
  extractionStatus: z.nativeEnum(ExtractionStatus),
  overallConfidence: z.number(),
  warnings: z.array(z.string()),
  processorName: z.string(),
  processorVersion: z.string(),
  
  jurisdiccionInmobiliaria: extractedFieldSchema,
  direccionRegionalMensurasCatastrales: extractedFieldSchema,
  departamento: extractedFieldSchema,
  operacion: extractedFieldSchema,
  designacionCatastralPosicional: extractedFieldSchema,
  designacionCatastralOrigen: extractedFieldSchema,
  provincia: extractedFieldSchema,
  municipio: extractedFieldSchema,
  seccion: extractedFieldSchema,
  lugar: extractedFieldSchema,
  superficieARegistrarParcelaM2: extractedFieldSchema,
  escala: extractedFieldSchema
});
