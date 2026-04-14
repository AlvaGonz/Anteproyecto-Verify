/** v1.1.1 - Forced Refresh */
import { InternalValidationSummaryDto, FindingDto, ValidationStatus, ValidationExecutionResult, ValidationExecutionStatus, AuditLogDto, AuditActionType } from "../types";
import { mockValidaciones } from "../../../infrastructure/mock/mockValidaciones";
import { mockHallazgos } from "../../../infrastructure/mock/mockHallazgos";
import { mockFullValidations } from "../../../infrastructure/mock/mockValidation";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";

let localMockValidaciones = [...mockValidaciones];
let localMockHallazgos = [...mockHallazgos];
let localMockFullValidations = [...mockFullValidations];

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

  runFullValidation: async (
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
            internalValidation: {
              validacionId: `val-${Math.random().toString(36).substr(2, 9)}`,
              proyectoId: projectId,
              status: ValidationStatus.Completed,
              esLegitimo: true,
              passedCount: 3,
              warningCount: 0,
              failedCount: 0,
              createdAtUtc: new Date().toISOString(),
              results: [
                { id: "1", nombreRegla: "Identidad del Propietario", passed: true, mensaje: "Coincidencia 100% con padrón electoral." },
                { id: "2", nombreRegla: "Superficie Catastral", passed: true, mensaje: "Área declarada dentro del margen tolerado (±0.05%)." },
                { id: "3", nombreRegla: "Gravámenes Vigentes", passed: true, mensaje: "Providencia registral libre de cargas." }
              ]
            },
            externalSources: [
              { sourceName: "DGII", status: "SUCCESS", dataFound: true, lastUpdate: new Date().toISOString() },
              { sourceName: "Catastro Nacional", status: "SUCCESS", dataFound: true, lastUpdate: new Date().toISOString() }
            ],
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
  getProjectAuditLogs: async (projectId: string): Promise<AuditLogDto[]> => {
    if (USE_MOCK) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const mockAuditLogs: AuditLogDto[] = [
            {
              id: "1",
              proyectoId: projectId,
              usuarioId: "u1",
              usuarioNombre: "Admin VeriFinca",
              accion: AuditActionType.ValidationRun,
              descripcion: "Ejecución de auditoría integral completada",
              fechaUtc: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
              metadataJson: null,
              ipAddress: "192.168.1.1"
            },
            {
              id: "2",
              proyectoId: projectId,
              usuarioId: "u1",
              usuarioNombre: "Admin VeriFinca",
              accion: AuditActionType.DocumentUpload,
              descripcion: "Sumbisión de Certificado de Título para validación",
              fechaUtc: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
              metadataJson: null,
              ipAddress: "192.168.1.1"
            }
          ];
          resolve(mockAuditLogs);
        }, 300);
      });
    }
    const response = await fetch(
      `${API_BASE_URL}/projects/${projectId}/audit-logs`,
    );
    if (!response.ok) throw new Error("Failed to fetch audit logs");
    return response.json();
  },
};
