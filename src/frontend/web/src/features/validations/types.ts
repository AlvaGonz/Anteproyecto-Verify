export enum ValidationStatus {
  Pending = 0,
  InProgress = 1,
  Completed = 2,
  Failed = 3,
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
