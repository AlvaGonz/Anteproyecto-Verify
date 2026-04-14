import { IFinding, FindingSeverity, FindingStatus, IFindingsSummary } from '../types/findings.types';

export const MOCK_FINDINGS: IFinding[] = [
  {
    id: 'VF-2024-001',
    title: 'Inconsistencia en linderos',
    description: 'Discrepancia de 14.5m² en límite Norte',
    severity: FindingSeverity.CRITICAL,
    source: 'Catastro',
    date: 'May 12, 2024',
    status: FindingStatus.PENDING,
    location: {
      lat: 18.4735,
      lng: -69.9324,
      areaName: 'North Boundary',
    },
  },
  {
    id: 'VF-2024-002',
    title: 'Impuestos pendientes 2023',
    description: 'IPI no liquidado periodo fiscal actual',
    severity: FindingSeverity.HIGH,
    source: 'DGII',
    date: 'May 10, 2024',
    status: FindingStatus.PENDING,
  },
  {
    id: 'VF-2024-003',
    title: 'Certificación vencida',
    description: 'Estado de carga y gravámenes caducado',
    severity: FindingSeverity.MEDIUM,
    source: 'Internal',
    date: 'May 08, 2024',
    status: FindingStatus.RESOLVED,
  },
  {
    id: 'VF-2024-004',
    title: 'Gravamen no declarado',
    description: 'Hipoteca en primer rango detectada',
    severity: FindingSeverity.CRITICAL,
    source: 'Internal',
    date: 'May 05, 2024',
    status: FindingStatus.PENDING,
  },
  {
    id: 'VF-2024-005',
    title: 'Uso de suelo conflictivo',
    description: 'Permiso comercial en zona residencial',
    severity: FindingSeverity.HIGH,
    source: 'Catastro',
    date: 'Apr 28, 2024',
    status: FindingStatus.RESOLVED,
  },
  {
    id: 'VF-2024-006',
    title: 'Error tipográfico en acta',
    description: 'Nombre de propietario con error menor',
    severity: FindingSeverity.LOW,
    source: 'Internal',
    date: 'Apr 25, 2024',
    status: FindingStatus.RESOLVED,
  },
];

export const MOCK_SUMMARY: IFindingsSummary = {
  total: 8,
  critical: 2,
  high: 3,
  medium: 2,
  low: 1,
  resolved: 3,
  integrityScore: 84,
  integrityTrend: -4,
};
