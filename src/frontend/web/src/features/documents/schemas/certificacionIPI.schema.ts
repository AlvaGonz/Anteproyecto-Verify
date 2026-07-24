import { z } from "zod";
import { extractedFieldSchema } from "./planoMensura.schema";
import { ExtractionStatus } from "../types";

export const certificacionIPIExtractionSchema = z.object({
  schemaVersion: z.string(),
  documentType: z.string(),
  extractionStatus: z.nativeEnum(ExtractionStatus),
  overallConfidence: z.number(),
  warnings: z.array(z.string()),
  processorName: z.string(),
  processorVersion: z.string(),

  numeroCertificacion: extractedFieldSchema,
  numeroInmueble: extractedFieldSchema,
  parcelaNumero: extractedFieldSchema,
});

export type CertificacionIPIExtraction = z.infer<typeof certificacionIPIExtractionSchema>;