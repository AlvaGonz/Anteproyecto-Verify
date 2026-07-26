import { z } from "zod";
import { ExtractionStatus } from "../types";
import { extractedFieldSchema } from "./planoMensura.schema";

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
declaracionEstadoLegal: extractedFieldSchema
});
