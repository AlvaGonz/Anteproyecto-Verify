import { ValidationExecutionResult, ValidationExecutionStatus } from "../../features/validation/types";
import { mockValidaciones } from "./mockValidaciones";

export const mockFullValidations: ValidationExecutionResult[] = [
  {
    projectId: "proj-001",
    executionId: "exec-001",
    startedAtUtc: "2026-01-20T10:00:00Z",
    completedAtUtc: "2026-01-20T10:05:00Z",
    overallStatus: ValidationExecutionStatus.Completed,
    isFullyValid: true,
    internalValidation: mockValidaciones[0],
    externalSources: [
      {
        sourceName: "Jurisdicción Inmobiliaria",
        status: "Completed",
        isSuccess: true,
        isMatch: true,
        summary: "Título verificado correctamente",
        findings: [],
        timestampUtc: "2026-01-20T10:02:00Z",
        referenceCode: "JI-2026-001"
      },
      {
        sourceName: "Ministerio de Medio Ambiente",
        status: "Completed",
        isSuccess: true,
        isMatch: true,
        summary: "Permiso ambiental vigente",
        findings: [],
        timestampUtc: "2026-01-20T10:03:00Z",
        referenceCode: "MA-2026-001"
      }
    ],
    errors: []
  },
  {
    projectId: "proj-003",
    executionId: "exec-002",
    startedAtUtc: "2026-02-12T10:00:00Z",
    completedAtUtc: "2026-02-12T10:05:00Z",
    overallStatus: ValidationExecutionStatus.Completed,
    isFullyValid: false,
    internalValidation: mockValidaciones[1],
    externalSources: [
      {
        sourceName: "Ayuntamiento de La Romana",
        status: "Completed",
        isSuccess: true,
        isMatch: false,
        summary: "Permiso de construcción rechazado",
        findings: ["Falta firma del director de planeamiento urbano"],
        timestampUtc: "2026-02-12T10:02:00Z",
        referenceCode: "AY-2026-003"
      }
    ],
    errors: []
  }
];
