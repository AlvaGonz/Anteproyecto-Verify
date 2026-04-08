import { InternalValidationSummaryDto } from "../validations/types";

export enum ValidationExecutionStatus {
  Pending = 1,
  Running = 2,
  Completed = 3,
  Failed = 4,
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
