/** v1.1.1 - Forced Refresh */
import { InternalValidationSummaryDto, FindingDto, ValidationStatus, ValidationExecutionResult, ValidationExecutionStatus, AuditLogDto, AuditActionType } from "../types";
import { mockValidaciones } from "../../../infrastructure/mock/mockValidaciones";
import { mockHallazgos } from "../../../infrastructure/mock/mockHallazgos";
import { mockFullValidations } from "../../../infrastructure/mock/mockValidation";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";

import { Result } from "../../../shared/types/Result";

let localMockValidaciones = [...mockValidaciones];
let localMockHallazgos = [...mockHallazgos];
let localMockFullValidations = [...mockFullValidations];

export const validationsApi = {
  runInternalValidation: async (
    projectId: string,
  ): Promise<Result<InternalValidationSummaryDto>> => {
    try {
      if (USE_MOCK) {
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
        return { _tag: "Success", data: { ...newValidation } };
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
      if (!response.ok) {
        return { _tag: "Failure", error: { message: "Failed to run internal validation", status: response.status } };
      }
      const data = await response.json();
      return { _tag: "Success", data };
    } catch (error) {
      return { _tag: "Failure", error: { message: error instanceof Error ? error.message : "Unknown error" } };
    }
  },

  getLatestInternalValidation: async (
    projectId: string,
  ): Promise<Result<InternalValidationSummaryDto | null>> => {
    try {
      if (USE_MOCK) {
        const projectValidations = localMockValidaciones
          .filter(v => v.proyectoId === projectId)
          .sort((a, b) => new Date(b.createdAtUtc).getTime() - new Date(a.createdAtUtc).getTime());
        return { _tag: "Success", data: projectValidations.length > 0 ? { ...projectValidations[0] } : null };
      }
      const response = await fetch(
        `${API_BASE_URL}/projects/${projectId}/validations/internal/latest`,
      );
      if (response.status === 404) return { _tag: "Success", data: null };
      if (!response.ok) {
        return { _tag: "Failure", error: { message: "Failed to fetch latest validation", status: response.status } };
      }
      const data = await response.json();
      return { _tag: "Success", data };
    } catch (error) {
      return { _tag: "Failure", error: { message: error instanceof Error ? error.message : "Unknown error" } };
    }
  },

  getProjectFindings: async (projectId: string): Promise<Result<FindingDto[]>> => {
    try {
      if (USE_MOCK) {
        return { _tag: "Success", data: localMockHallazgos.filter(h => h.proyectoId === projectId) };
      }
      const response = await fetch(
        `${API_BASE_URL}/projects/${projectId}/findings`,
      );
      if (!response.ok) {
        return { _tag: "Failure", error: { message: "Failed to fetch findings", status: response.status } };
      }
      const data = await response.json();
      return { _tag: "Success", data };
    } catch (error) {
      return { _tag: "Failure", error: { message: error instanceof Error ? error.message : "Unknown error" } };
    }
  },

  runFullValidation: async (
    projectId: string,
  ): Promise<Result<ValidationExecutionResult>> => {
    try {
      if (USE_MOCK) {
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
        return { _tag: "Success", data: { ...newValidation } };
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
      if (!response.ok) {
        return { _tag: "Failure", error: { message: "Failed to run full validation", status: response.status } };
      }
      const data = await response.json();
      return { _tag: "Success", data };
    } catch (error) {
      return { _tag: "Failure", error: { message: error instanceof Error ? error.message : "Unknown error" } };
    }
  },

  getValidationResult: async (
    projectId: string,
  ): Promise<Result<ValidationExecutionResult | null>> => {
    try {
      if (USE_MOCK) {
        const validations = localMockFullValidations
          .filter(v => v.projectId === projectId)
          .sort((a, b) => new Date(b.startedAtUtc).getTime() - new Date(a.startedAtUtc).getTime());
        return { _tag: "Success", data: validations.length > 0 ? { ...validations[0] } : null };
      }
      const response = await fetch(
        `${API_BASE_URL}/projects/${projectId}/validation-result`,
      );
      if (response.status === 404) return { _tag: "Success", data: null };
      if (!response.ok) {
        return { _tag: "Failure", error: { message: "Failed to fetch validation result", status: response.status } };
      }
      const data = await response.json();
      return { _tag: "Success", data };
    } catch (error) {
      return { _tag: "Failure", error: { message: error instanceof Error ? error.message : "Unknown error" } };
    }
  },
  getProjectAuditLogs: async (projectId: string): Promise<Result<AuditLogDto[]>> => {
    try {
      if (USE_MOCK) {
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
        return { _tag: "Success", data: mockAuditLogs };
      }
      const response = await fetch(
        `${API_BASE_URL}/projects/${projectId}/audit-logs`,
      );
      if (!response.ok) {
        return { _tag: "Failure", error: { message: "Failed to fetch audit logs", status: response.status } };
      }
      const data = await response.json();
      return { _tag: "Success", data };
    } catch (error) {
      return { _tag: "Failure", error: { message: error instanceof Error ? error.message : "Unknown error" } };
    }
  },
};
