import { PublicProjectVerificationDto } from "../types";
import { mockPublicProjectVerifications } from "../../../infrastructure/mock/mockPublicVerifications";
import { Result } from "../../../shared/utils/functional";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";

export interface PublicVerificationError {
  message: string;
  status?: number;
}

export const publicVerificationApi = {
  verifyCode: async (
    code: string,
    type: string = "cert"
  ): Promise<Result<PublicProjectVerificationDto | null, PublicVerificationError>> => {
    try {
      if (USE_MOCK) {
        // Simular búsqueda por diferentes criterios en el mock
        const verification = mockPublicProjectVerifications.find(v => {
          switch (type) {
            case "suelo": return v.numSuelo === code;
            case "ipi": return v.ipi === code;
            case "rnc": return v.rnc === code;
            case "ced":
            case "cedula": return v.cedula === code;
            case "cert": 
            default: return v.publicCode === code;
          }
        });
        
        if (verification) {
          return { _tag: "Success", data: { ...verification, isRegistered: true } };
        }

        const REGEX_PATTERNS = {
          suelo: /^\d{3}-\d{2}-\d{3}$/,
          rnc: /^\d-\d{2}-\d{5}-\d$/,
          ipi: /^\d-\d{2}-\d{5}-\d$/,
          ced: /^\d{3}-\d{7}-\d$/,
          cedula: /^\d{3}-\d{7}-\d$/,
        };

        const pattern = REGEX_PATTERNS[type as keyof typeof REGEX_PATTERNS];
        if (pattern && pattern.test(code)) {
          const unregDto: PublicProjectVerificationDto = {
            publicCode: "VF-UNREG-" + code.replace(/-/g, ""),
            projectName: type === "cedula" || type === "ced" ? "Persona Física No Registrada" :
                         type === "rnc" ? "Empresa / Contribuyente No Registrado" :
                         type === "suelo" ? "Parcela Catastral No Certificada" : "Consulta Externa No Registrada",
            publicLocation: "República Dominicana",
            publicProjectStatus: "No Certificado",
            integrityStatus: "No Registrado",
            verificationMessage: "Esta persona o entidad posee un registro oficial válido en las instituciones estatales (DGII, JCE o Catastro), pero no se encuentra registrada ni certificada en la plataforma VeriFinca.",
            isVerifiable: false,
            isRegistered: false,
            summary: "Verificación externa exitosa. El documento consultado corresponde a un registro activo y vigente en las bases de datos del Estado dominicano. Para gozar de las garantías del sello digital VeriFinca, la entidad debe completar su registro.",
            developerName: type === "cedula" || type === "ced" ? "Consulta JCE (Cédula de Identidad)" :
                           type === "rnc" ? "Consulta DGII (RNC Activo)" : "Consulta Catastro Nacional",
            numSuelo: type === "suelo" ? code : undefined,
            rnc: type === "rnc" ? code : undefined,
            cedula: type === "cedula" || type === "ced" ? code : undefined,
            ipi: type === "ipi" ? code : undefined,
            validationDimensions: [
              { label: type === "cedula" || type === "ced" ? "Registro en Padrón JCE" : type === "rnc" ? "Registro en RNC (DGII)" : "Registro Catastral Oficial", checked: true },
              { label: "Estatus Civil / Tributario Activo", checked: true },
              { label: "Sello Digital VeriFinca", checked: false },
              { label: "Certificación Inmutable", checked: false },
              { label: "Fideicomiso / Fondos en Garantía", checked: false }
            ]
          };
          return { _tag: "Success", data: unregDto };
        }

        return { _tag: "Success", data: null };
      }
      
      const params = new URLSearchParams({ type });
      const response = await fetch(`${API_BASE_URL}/public/verify/${code}?${params.toString()}`);
      
      if (response.status === 404) return { _tag: "Success", data: null };
      if (!response.ok) {
        return { _tag: "Failure", error: { message: "Failed to verify code", status: response.status } };
      }
      const data = await response.json();
      return { _tag: "Success", data };
    } catch (error) {
      return { _tag: "Failure", error: { message: error instanceof Error ? error.message : "Unknown error" } };
    }
  },
};
