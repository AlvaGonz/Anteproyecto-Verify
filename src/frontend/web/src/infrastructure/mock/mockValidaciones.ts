import { InternalValidationSummaryDto, ValidationStatus, RuleStatus, FindingSeverity } from "../../features/validations/types";

export const mockValidaciones: InternalValidationSummaryDto[] = [
  {
    validacionId: "val-001",
    proyectoId: "proj-001",
    status: ValidationStatus.Success,
    esLegitimo: true,
    passedCount: 5,
    warningCount: 0,
    failedCount: 0,
    createdAtUtc: "2026-01-20T10:00:00Z",
    results: [
      {
        id: "res-001",
        ruleCode: "DOC-001",
        ruleName: "Verificación de Título",
        status: RuleStatus.Passed,
        message: "El título coincide con los registros de la Jurisdicción Inmobiliaria.",
        severity: null,
        relatedDocumentId: "doc-001"
      },
      {
        id: "res-002",
        ruleCode: "PER-001",
        ruleName: "Permiso Ambiental",
        status: RuleStatus.Passed,
        message: "Permiso ambiental vigente y validado.",
        severity: null,
        relatedDocumentId: "doc-003"
      }
    ]
  },
  {
    validacionId: "val-002",
    proyectoId: "proj-003",
    status: ValidationStatus.Failed,
    esLegitimo: false,
    passedCount: 2,
    warningCount: 1,
    failedCount: 2,
    createdAtUtc: "2026-02-12T10:00:00Z",
    results: [
      {
        id: "res-003",
        ruleCode: "PER-002",
        ruleName: "Permiso de Construcción",
        status: RuleStatus.Failed,
        message: "El permiso del ayuntamiento fue rechazado.",
        severity: FindingSeverity.High,
        relatedDocumentId: "doc-005"
      },
      {
        id: "res-004",
        ruleCode: "DOC-002",
        ruleName: "Vigencia de Documentos",
        status: RuleStatus.Warning,
        message: "Algunos documentos están próximos a vencer.",
        severity: FindingSeverity.Medium,
        relatedDocumentId: null
      }
    ]
  },
  {
    validacionId: "val-003",
    proyectoId: "proj-004",
    status: ValidationStatus.InProgress,
    esLegitimo: null,
    passedCount: 1,
    warningCount: 0,
    failedCount: 0,
    createdAtUtc: "2026-03-21T10:00:00Z",
    results: []
  }
];
