/** v1.1.1 - Forced Refresh */
import { InternalValidationSummaryDto, FindingDto, ValidationStatus, ValidationExecutionResult, ValidationExecutionStatus, AuditLogDto, AuditActionType, RuleStatus } from "../types";
import { mockValidaciones } from "../../../infrastructure/mock/mockValidaciones";
import { mockHallazgos } from "../../../infrastructure/mock/mockHallazgos";
import { mockFullValidations } from "../../../infrastructure/mock/mockValidation";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";

import { Result } from "../../../shared/utils/functional";

type ApiError = { message: string; status?: number };

let localMockValidaciones = [...mockValidaciones];
let localMockHallazgos = [...mockHallazgos];
let localMockFullValidations = [...mockFullValidations];

export const validationsApi = {
  runInternalValidation: async (
    projectId: string,
  ): Promise<Result<InternalValidationSummaryDto, ApiError>> => {
    try {
      if (USE_MOCK) {
        const newValidation: InternalValidationSummaryDto = {
          validacionId: `val-${Math.random().toString(36).substr(2, 9)}`,
          proyectoId: projectId,
          status: ValidationStatus.InProgress,
          esLegitimo: null,
          integrityScore: 0,
          selloName: null,
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
  ): Promise<Result<InternalValidationSummaryDto | null, ApiError>> => {
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

  getProjectFindings: async (projectId: string): Promise<Result<FindingDto[], ApiError>> => {
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
  ): Promise<Result<ValidationExecutionResult, ApiError>> => {
    try {
      if (USE_MOCK) {
        const newValidation: ValidationExecutionResult = {
          projectId: projectId,
          executionId: `exec-${Math.random().toString(36).substr(2, 9)}`,
          startedAtUtc: new Date().toISOString(),
          completedAtUtc: new Date().toISOString(),
          overallStatus: ValidationExecutionStatus.Completed,
          isFullyValid: true,
          overallIntegrityScore: 100,
          integritySeal: "Sello de Oro",
          internalValidation: {
            validacionId: `val-${Math.random().toString(36).substr(2, 9)}`,
            proyectoId: projectId,
            status: ValidationStatus.Success,
            esLegitimo: true,
            integrityScore: 100,
            selloName: "Sello de Oro",
            passedCount: 3,
            warningCount: 0,
            failedCount: 0,
            createdAtUtc: new Date().toISOString(),
            results: [
              { id: "1", ruleCode: "VAL-001", ruleName: "Identidad del Propietario", status: RuleStatus.Passed, message: "Coincidencia 100% con padrón electoral.", severity: null, relatedDocumentId: null },
              { id: "2", ruleCode: "VAL-002", ruleName: "Superficie Catastral", status: RuleStatus.Passed, message: "Área declarada dentro del margen tolerado (±0.05%).", severity: null, relatedDocumentId: null },
              { id: "3", ruleCode: "VAL-003", ruleName: "Gravámenes Vigentes", status: RuleStatus.Passed, message: "Providencia registral libre de cargas.", severity: null, relatedDocumentId: null }
            ]
          },
          externalSources: [
            { sourceName: "DGII", status: "SUCCESS", isSuccess: true, isMatch: true, summary: "Datos encontrados", findings: [], timestampUtc: new Date().toISOString() },
            { sourceName: "Catastro Nacional", status: "SUCCESS", isSuccess: true, isMatch: true, summary: "Datos encontrados", findings: [], timestampUtc: new Date().toISOString() }
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
  ): Promise<Result<ValidationExecutionResult | null, ApiError>> => {
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
  getProjectAuditLogs: async (projectId: string): Promise<Result<AuditLogDto[], ApiError>> => {
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
