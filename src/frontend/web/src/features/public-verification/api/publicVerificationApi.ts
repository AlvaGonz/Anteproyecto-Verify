import { PublicProjectVerificationDto } from "../types";
import { mockPublicProjectVerifications } from "../../../infrastructure/mock/mockPublicVerifications";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";

export const publicVerificationApi = {
  verifyCode: async (
    code: string,
  ): Promise<PublicProjectVerificationDto | null> => {
    if (USE_MOCK) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const verification = mockPublicProjectVerifications.find(v => v.publicCode === code);
          resolve(verification ? { ...verification } : null);
        }, 300);
      });
    }
    const response = await fetch(`${API_BASE_URL}/public/verify/${code}`);
    if (response.status === 404) return null;
    if (!response.ok) throw new Error("Failed to verify code");
    return response.json();
  },
};
