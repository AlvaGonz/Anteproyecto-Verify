import { InternalValidationSummaryDto, FindingDto, ValidationStatus } from "../types";
import { mockValidaciones } from "../../../infrastructure/mock/mockValidaciones";
import { mockHallazgos } from "../../../infrastructure/mock/mockHallazgos";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";

let localMockValidaciones = [...mockValidaciones];
let localMockHallazgos = [...mockHallazgos];

export const validationsApi = {
  runInternalValidation: async (
    projectId: string,
  ): Promise<InternalValidationSummaryDto> => {
    if (USE_MOCK) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const newValidation: InternalValidationSummaryDto = {
            validacionId: `val-${Math.random().toString(36).substr(2, 9)}`,
            proyectoId: projectId,
            status: ValidationStatus.InProgress,
            esLegitimo: null,
            passedCount: 0,
            warningCount: 0,
            failedCount: 0,
            createdAtUtc: new Date().toISOString(),
            results: []
          };
          localMockValidaciones.push(newValidation);
          resolve({ ...newValidation });
        }, 1000);
      });
    }
    const response = await fetch(
      `${API_BASE_URL}/projects/${projectId}/validations/internal/run`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    if (!response.ok) throw new Error("Failed to run internal validation");
    return response.json();
  },

  getLatestInternalValidation: async (
    projectId: string,
  ): Promise<InternalValidationSummaryDto | null> => {
    if (USE_MOCK) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const projectValidations = localMockValidaciones
            .filter(v => v.proyectoId === projectId)
            .sort((a, b) => new Date(b.createdAtUtc).getTime() - new Date(a.createdAtUtc).getTime());
          resolve(projectValidations.length > 0 ? { ...projectValidations[0] } : null);
        }, 300);
      });
    }
    const response = await fetch(
      `${API_BASE_URL}/projects/${projectId}/validations/internal/latest`,
    );
    if (response.status === 404) return null;
    if (!response.ok) throw new Error("Failed to fetch latest validation");
    return response.json();
  },

  getProjectFindings: async (projectId: string): Promise<FindingDto[]> => {
    if (USE_MOCK) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(localMockHallazgos.filter(h => h.proyectoId === projectId));
        }, 300);
      });
    }
    const response = await fetch(
      `${API_BASE_URL}/projects/${projectId}/findings`,
    );
    if (!response.ok) throw new Error("Failed to fetch findings");
    return response.json();
  },
};
