import { CertificationDto, PublicVerificationDto, CertificationStatus } from "../types";
import { mockCertifications, mockPublicVerifications } from "../../../infrastructure/mock/mockCertifications";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";

let localMockCertifications = [...mockCertifications];

export const certificationsApi = {
  issueCertification: async (projectId: string): Promise<CertificationDto> => {
    if (USE_MOCK) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const newCert: CertificationDto = {
            id: `cert-${Math.random().toString(36).substr(2, 9)}`,
            proyectoId: projectId,
            codigoVerificacion: `VF-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
            estadoCertificacion: CertificationStatus.Vigente,
            fechaEmisionUtc: new Date().toISOString(),
            fechaVigenciaUtc: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
            urlVerificacion: `https://verifinca.do/verify/VF-NEW`,
            scoreIntegridad: 100,
            estadoIntegridad: 2,
            revocado: false
          };
          localMockCertifications.push(newCert);
          resolve({ ...newCert });
        }, 1000);
      });
    }
    const response = await fetch(
      `${API_BASE_URL}/projects/${projectId}/certifications`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    if (!response.ok) {
      const err = await response.text();
      throw new Error(err || "Failed to issue certification");
    }
    return response.json();
  },

  getCurrentCertification: async (
    projectId: string,
  ): Promise<CertificationDto | null> => {
    if (USE_MOCK) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const cert = localMockCertifications.find(c => c.proyectoId === projectId && !c.revocado);
          resolve(cert ? { ...cert } : null);
        }, 300);
      });
    }
    const response = await fetch(
      `${API_BASE_URL}/projects/${projectId}/certifications/current`,
    );
    if (response.status === 404) return null;
    if (!response.ok) throw new Error("Failed to fetch certification");
    return response.json();
  },

  verifyCode: async (code: string): Promise<PublicVerificationDto | null> => {
    if (USE_MOCK) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const verification = mockPublicVerifications.find(v => v.codigoVerificacion === code);
          resolve(verification ? { ...verification } : null);
        }, 300);
      });
    }
    const response = await fetch(`${API_BASE_URL}/verify/${code}`);
    if (response.status === 404) return null;
    if (!response.ok) throw new Error("Failed to verify code");
    return response.json();
  },
};
