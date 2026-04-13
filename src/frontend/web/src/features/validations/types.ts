export enum ValidationStatus {
  Pending = 1,
  InProgress = 2,
  Success = 3,
  Warning = 4,
  Failed = 5,
}

export enum ValidationExecutionStatus {
  Pending = 1,
  Running = 2,
  Completed = 3,
  Failed = 4,
}

export enum RuleStatus {
  Passed = 1,
  Warning = 2,
  Failed = 3,
  NotApplicable = 4,
}

export enum FindingSeverity {
  Low = 1,
  Medium = 2,
  High = 3,
  Critical = 4,
}

export interface ValidationSourceResult {
  sourceName: string;
  status: string;
  isSuccess: boolean;
  isMatch: boolean;
  summary: string;
  findings: string[];
  timestampUtc: string;
  referenceCode?: string;
  errorMessage?: string;
}

export interface ValidationRuleResultDto {
  id: string;
  ruleCode: string;
  ruleName: string;
  status: RuleStatus;
  message: string;
  severity: FindingSeverity | null;
  relatedDocumentId: string | null;
}

export interface InternalValidationSummaryDto {
  validacionId: string;
  proyectoId: string;
  status: ValidationStatus;
  esLegitimo: boolean | null;
  passedCount: number;
  warningCount: number;
  failedCount: number;
  createdAtUtc: string;
  results: ValidationRuleResultDto[];
}

export interface ValidationExecutionResult {
  projectId: string;
  executionId: string;
  startedAtUtc: string;
  completedAtUtc: string;
  overallStatus: ValidationExecutionStatus;
  isFullyValid: boolean;
  internalValidation: InternalValidationSummaryDto | null;
  externalSources: ValidationSourceResult[];
  errors: string[];
}

export interface FindingDto {
  id: string;
  proyectoId: string;
  validacionId: string | null;
  severidad: FindingSeverity;
  codigo: string;
  titulo: string;
  descripcion: string;
  recomendacion: string | null;
  resuelto: boolean;
  createdAtUtc: string;
}
