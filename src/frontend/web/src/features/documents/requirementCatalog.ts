import { DocumentDto, DocumentType, DocumentStatus } from "./types";

export type RequirementCode =
  | "TITULO_PROPIEDAD"
  | "LEGAL_STATUS"
  | "PLANO_MENSURA"
  | "ID_PROPIETARIO"
  | "PODER_NOTARIAL"
  | "USO_SUELO"
  | "REGISTRO_MERCANTIL"
  | "CERTIFICACION_IPI"
  | "RNC"
  | "ESTADOS_FINANCIEROS"
  | "CERT_BANCARIAS"
  | "CONSENTIMIENTO_DIGITAL"
  | "RESOLUCION_CONFOTUR"
  | "LICENCIA_AMBIENTAL"
  | "REGISTRO_SANITARIO"
  | "IMPACTO_TRAFICO"
  | "REGIMEN_CONDOMINIO"
  | "RESOLUCION_ZONIFICACION";

export interface RequirementDefinition {
  code: RequirementCode;
  label: string;
  description: string;
  documentType: DocumentType;
  acceptedMimeTypes: string; // e.g. "application/pdf,image/jpeg"
  maxSizeBytes: number;
  required: boolean;
  optional?: boolean;
}

const DEFAULT_MAX_SIZE = 10 * 1024 * 1024; // 10MB
const DEFAULT_MIME = "application/pdf,image/jpeg,image/png";

export const BASE_REQUIREMENTS: RequirementDefinition[] = [
  {
    code: "TITULO_PROPIEDAD",
    label: "Certificado de Título de Propiedad",
    description: "Documento oficial emitido por Registro de Títulos",
    documentType: DocumentType.CertificadoTitulo,
    acceptedMimeTypes: DEFAULT_MIME,
    maxSizeBytes: DEFAULT_MAX_SIZE,
    required: true,
  },
  {
    code: "PLANO_MENSURA",
    label: "Plano de Mensura Catastral",
    description: "Planos oficiales aprobados por Mensuras Catastrales",
    documentType: DocumentType.PlanoMensuraCatastral,
    acceptedMimeTypes: DEFAULT_MIME,
    maxSizeBytes: DEFAULT_MAX_SIZE,
    required: true,
  },
  {
    code: "USO_SUELO",
    label: "Certificación de Uso de Suelo",
    description: "Emitido por el ayuntamiento correspondiente",
    documentType: DocumentType.CertificadoUsoSuelo,
    acceptedMimeTypes: "application/pdf",
    maxSizeBytes: DEFAULT_MAX_SIZE,
    required: true,
  },
  {
    code: "REGISTRO_MERCANTIL",
    label: "Registro Mercantil",
    description: "Copia actualizada del Registro Mercantil",
    documentType: DocumentType.RegistroMercantil,
    acceptedMimeTypes: "application/pdf",
    maxSizeBytes: DEFAULT_MAX_SIZE,
    required: true,
  },
  {
    code: "RNC",
    label: "Registro Nacional de Contribuyente (RNC)",
    description: "Tarjeta de RNC activa",
    documentType: DocumentType.RNC,
    acceptedMimeTypes: DEFAULT_MIME,
    maxSizeBytes: DEFAULT_MAX_SIZE,
    required: true,
  },
  {
    code: "CERTIFICACION_IPI",
    label: "Certificación IPI al día",
    description: "Certificación de no adeudo de Impuesto al Patrimonio Inmobiliario",
    documentType: DocumentType.CertificacionIPI,
    acceptedMimeTypes: "application/pdf",
    maxSizeBytes: DEFAULT_MAX_SIZE,
    required: true,
  },
  {
    code: "ESTADOS_FINANCIEROS",
    label: "Estados Financieros",
    description: "Estados financieros auditados del último período",
    documentType: DocumentType.EstadosFinancieros,
    acceptedMimeTypes: "application/pdf",
    maxSizeBytes: DEFAULT_MAX_SIZE,
    required: false,
    optional: true,
  },
  {
    code: "CERT_BANCARIAS",
    label: "Certificaciones Bancarias",
    description: "Referencias bancarias actualizadas",
    documentType: DocumentType.CertificacionesBancarias,
    acceptedMimeTypes: "application/pdf",
    maxSizeBytes: DEFAULT_MAX_SIZE,
    required: false,
    optional: true,
  },
  {
    code: "CONSENTIMIENTO_DIGITAL",
    label: "Formulario de Consentimiento KYC",
    description: "Formulario debidamente firmado",
    documentType: DocumentType.FormularioKYCAML,
    acceptedMimeTypes: "application/pdf",
    maxSizeBytes: DEFAULT_MAX_SIZE,
    required: false,
    optional: true,
  },
];

export const CATEGORY_REQUIREMENTS: Record<string, RequirementDefinition[]> = {
  1: [ // Residencial
    {
      code: "REGIMEN_CONDOMINIO",
      label: "Régimen de Condominio",
      description: "Declaratoria y reglamento de condominio",
      documentType: DocumentType.Other,
      acceptedMimeTypes: "application/pdf",
      maxSizeBytes: DEFAULT_MAX_SIZE,
      required: true,
    }
  ],
  2: [ // Comercial
    {
      code: "REGISTRO_SANITARIO",
      label: "Registro Sanitario",
      description: "Permiso de operación",
      documentType: DocumentType.Other,
      acceptedMimeTypes: "application/pdf",
      maxSizeBytes: DEFAULT_MAX_SIZE,
      required: true,
    },
    {
      code: "IMPACTO_TRAFICO",
      label: "Estudio de Impacto de Tráfico",
      description: "Aprobado por las autoridades correspondientes",
      documentType: DocumentType.Other,
      acceptedMimeTypes: "application/pdf",
      maxSizeBytes: DEFAULT_MAX_SIZE,
      required: true,
    }
  ],
  3: [ // Turistico
    {
      code: "RESOLUCION_CONFOTUR",
      label: "Resolución CONFOTUR",
      description: "Clasificación provisional o definitiva CONFOTUR",
      documentType: DocumentType.Other,
      acceptedMimeTypes: "application/pdf",
      maxSizeBytes: DEFAULT_MAX_SIZE,
      required: true,
    },
    {
      code: "LICENCIA_AMBIENTAL",
      label: "Licencia Ambiental",
      description: "Emitida por el Ministerio de Medio Ambiente",
      documentType: DocumentType.CertificadoEIA,
      acceptedMimeTypes: "application/pdf",
      maxSizeBytes: DEFAULT_MAX_SIZE,
      required: true,
    }
  ],
  4: [ // Mixto
    {
      code: "RESOLUCION_ZONIFICACION",
      label: "Resolución Especial de Zonificación",
      description: "Aprobación especial por uso mixto",
      documentType: DocumentType.Other,
      acceptedMimeTypes: "application/pdf",
      maxSizeBytes: DEFAULT_MAX_SIZE,
      required: true,
    }
  ],
  5: [], // Industrial
  99: [] // Otro
};

export const getRequirementsForCategory = (categoryId: number): RequirementDefinition[] => {
  const categoryReqs = CATEGORY_REQUIREMENTS[categoryId] || [];
  return [...BASE_REQUIREMENTS, ...categoryReqs];
};

export type RequirementStatus = 'missing' | 'uploaded' | 'uploading' | 'error' | 'invalid' | 'optional';

export const resolveRequirementStatus = (
  requirement: RequirementDefinition,
  uploadedDocuments: DocumentDto[]
): RequirementStatus => {
  const match = uploadedDocuments.find(d => {
    if (d.tipoDocumento === DocumentType.Other && requirement.documentType === DocumentType.Other) {
      return d.observaciones === requirement.code && d.activo;
    }
    return d.tipoDocumento === requirement.documentType && d.activo;
  });

  if (!match) {
    return requirement.optional ? 'optional' : 'missing';
  }

  if (match.estadoDocumento === DocumentStatus.Invalid) {
    return 'invalid';
  }

  return 'uploaded';
};
