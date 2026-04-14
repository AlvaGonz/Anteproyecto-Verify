import { PublicProjectVerificationDto } from "../types";
import { mockPublicProjectVerifications } from "../../../infrastructure/mock/mockPublicVerifications";
import { Result } from "../../../shared/utils/result";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";

export const publicVerificationApi = {
  verifyCode: async (
    code: string,
  ): Promise<Result<PublicProjectVerificationDto | null>> => {
    try {
      if (USE_MOCK) {
        const verification = mockPublicProjectVerifications.find(v => v.publicCode === code);
        return { _tag: "Success", data: verification ? { ...verification } : null };
      }
      const response = await fetch(`${API_BASE_URL}/public/verify/${code}`);
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
