/**
 * findings.types.ts
 * Type definitions for the validation findings domain.
 */

export enum FindingSeverity {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

export enum FindingStatus {
  PENDING = 'PENDING',
  RESOLVED = 'RESOLVED',
}

export interface IFinding {
  id: string;
  title: string;
  description: string;
  severity: FindingSeverity;
  source: string;
  date: string;
  status: FindingStatus;
  location?: {
    lat: number;
    lng: number;
    areaName: string;
  };
}

export interface IFindingsSummary {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  resolved: number;
  integrityScore: number;
  integrityTrend: number; // e.g., -4 for a 4% decrease
}
