import { PublicProjectVerificationDto } from "../../features/public-verification/types";

export const mockPublicProjectVerifications: PublicProjectVerificationDto[] = [
  {
    publicCode: "VF-2026-X83L",
    projectName: "Residencial Las Palmas",
    publicLocation: "Bávaro, Punta Cana, República Dominicana",
    publicProjectStatus: "Construcción Avanzada (85%)",
    integrityStatus: "Consistente",
    verificationMessage: "Este proyecto ha cumplido satisfactoriamente con todos los protocolos de integridad de VeriFinca.",
    lastVerifiedUtc: "2026-03-20T14:30:00Z",
    isVerifiable: true,
    summary: "Proyecto verificado bajo la Ley 189-11 de Desarrollo del Mercado Hipotecario y Fideicomiso. Todos los permisos ambientales y municipales se encuentran vigentes y validados vía blockchain.",
    developerName: "Grupo Inmobiliario del Este S.A.S",
    validationDimensions: [
      { label: "Titularidad de Tierra", checked: true },
      { label: "Permisos Ambientales", checked: true },
      { label: "Licencia de Construcción", checked: true },
      { label: "Cumplimiento Ley 189-11", checked: true },
      { label: "Auditoría Técnica Externa", checked: true },
    ]
  },
  {
    publicCode: "VF-2025-Y11Z",
    projectName: "Torre Bella Vista",
    publicLocation: "Distrito Nacional, Santo Domingo",
    publicProjectStatus: "Entrega Inmediata",
    integrityStatus: "Con Observaciones",
    verificationMessage: "Proyecto verificado con avisos técnicos preventivos.",
    lastVerifiedUtc: "2026-04-05T09:15:00Z",
    isVerifiable: true,
    summary: "Edificación completada. Se detectaron observaciones menores en el registro de áreas comunes que están en proceso de rectificación ante las autoridades correspondientes.",
    developerName: "Desarrollos Modernos Metro, SRL",
    validationDimensions: [
      { label: "Titularidad de Tierra", checked: true },
      { label: "Permisos Ambientales", checked: true },
      { label: "Licencia de Construcción", checked: true },
      { label: "Título Individual", checked: false },
      { label: "Reglamento de Condominio", checked: true },
    ]
  },
  {
    publicCode: "VF-2026-VOID",
    projectName: "Eco Village Paradise",
    publicLocation: "Samaná, República Dominicana",
    publicProjectStatus: "Suspendido / Auditoría Externa",
    integrityStatus: "Inconsistente",
    verificationMessage: "ESTATUS CRÍTICO: El proyecto no cumple con los protocolos mínimos de integridad documental.",
    lastVerifiedUtc: "2026-04-10T11:00:00Z",
    isVerifiable: false,
    summary: "ALERTA: Se han detectado inconsistencias graves entre la documentación legal presentada y los registros en Catastro Nacional. Se recomienda precaución extrema.",
    developerName: "Unknown Developer Group",
    validationDimensions: [
      { label: "Titularidad de Tierra", checked: false },
      { label: "Permisos Ambientales", checked: false },
      { label: "Licencia de Construcción", checked: false },
      { label: "Cumplimiento Ley 189-11", checked: false },
      { label: "Registro de Título", checked: false },
    ]
  }
];
