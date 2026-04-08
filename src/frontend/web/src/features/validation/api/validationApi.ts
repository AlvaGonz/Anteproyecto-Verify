import { ValidationExecutionResult, ValidationExecutionStatus } from "../types";
import { mockFullValidations } from "../../../infrastructure/mock/mockValidation";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";

let localMockFullValidations = [...mockFullValidations];

export const fullValidationApi = {
  runValidation: async (
    projectId: string,
  ): Promise<ValidationExecutionResult> => {
    if (USE_MOCK) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const newValidation: ValidationExecutionResult = {
            projectId: projectId,
            executionId: `exec-${Math.random().toString(36).substr(2, 9)}`,
            startedAtUtc: new Date().toISOString(),
            completedAtUtc: new Date().toISOString(),
            overallStatus: ValidationExecutionStatus.Completed,
            isFullyValid: true,
            internalValidation: null,
            externalSources: [],
            errors: []
          };
          localMockFullValidations.push(newValidation);
          resolve({ ...newValidation });
        }, 1500);
      });
    }
    const response = await fetch(
      `${API_BASE_URL}/projects/${projectId}/validate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    if (!response.ok) throw new Error("Failed to run full validation");
    return response.json();
  },

  getValidationResult: async (
    projectId: string,
  ): Promise<ValidationExecutionResult | null> => {
    if (USE_MOCK) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const validations = localMockFullValidations
            .filter(v => v.projectId === projectId)
            .sort((a, b) => new Date(b.startedAtUtc).getTime() - new Date(a.startedAtUtc).getTime());
          resolve(validations.length > 0 ? { ...validations[0] } : null);
        }, 300);
      });
    }
    const response = await fetch(
      `${API_BASE_URL}/projects/${projectId}/validation-result`,
    );
    if (response.status === 404) return null;
    if (!response.ok) throw new Error("Failed to fetch validation result");
    return response.json();
  },
};
