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
            case "ced": return v.cedula === code;
            case "cert": 
            default: return v.publicCode === code;
          }
        });
        return { _tag: "Success", data: verification ? { ...verification } : null };
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
