export type DocumentType = 'titulo' | 'estado-juridico' | 'plano-mensura' | 'cedula' | 'certificacion-ipi';

export interface ValidationRule {
  documentType: DocumentType;
  fieldsToValidate: string[];
  matchStrategy: 'exact' | 'fuzzy' | 'range';
  tolerance?: number; // Para range (ej: 0.05 = ±5%)
  alertMessage: (projectValue: any, documentValue: any, fieldName: string) => string;
}

export const VALIDATION_RULES: Record<DocumentType, ValidationRule> = {
  'titulo': {
    documentType: 'titulo',
    fieldsToValidate: ['matricula', 'provincia', 'desarrollador', 'superficieM2', 'designacionCatastral'],
    matchStrategy: 'exact',
    alertMessage: (proj, doc, field) => `Discrepancia en ${field}: Declarado (${proj || 'N/A'}) vs Oficial (${doc || 'N/A'})`
  },
  'estado-juridico': {
    documentType: 'estado-juridico',
    fieldsToValidate: ['matricula', 'provincia', 'estatus', 'designacionCatastral', 'superficieM2'],
    matchStrategy: 'exact',
    alertMessage: (proj, doc, field) => `Discrepancia en ${field}: Declarado (${proj || 'N/A'}) vs Oficial (${doc || 'N/A'})`
  },
  'plano-mensura': {
    documentType: 'plano-mensura',
    fieldsToValidate: ['designacionCatastral', 'superficieM2', 'provincia'],
    matchStrategy: 'exact',
    alertMessage: (proj, doc, field) => `Fuera de rango en ${field}: Declarado (${proj || 'N/A'}) vs Oficial (${doc || 'N/A'})`
  },
  'cedula': {
    documentType: 'cedula',
    fieldsToValidate: ['rnc_cedula', 'nombre_desarrollador'],
    matchStrategy: 'exact',
    alertMessage: (proj, doc, field) => `Discrepancia en ${field}: Declarado (${proj || 'N/A'}) vs Oficial (${doc || 'N/A'})`
  },
  'certificacion-ipi': {
    documentType: 'certificacion-ipi',
    fieldsToValidate: ['numeroInmueble'],
    matchStrategy: 'exact',
    alertMessage: (proj, doc, field) => `Discrepancia en ${field}: Declarado (${proj || 'N/A'}) vs Oficial (${doc || 'N/A'})`
  }
};
