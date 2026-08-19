import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useDiscrepancyCheck } from './useDiscrepancyCheck';
import * as useProjectsApi from '../../projects/api/useProjects';
import * as useRulesApi from '../../rules/api/useRules';

vi.mock('../../projects/api/useProjects');
vi.mock('../../rules/api/useRules');

describe('useDiscrepancyCheck', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should ignore superficieM2 discrepancy for plano-mensura when RULE-008-SUPERFICIE is inactive', () => {
    vi.spyOn(useProjectsApi, 'useProject').mockReturnValue({
      data: {
        id: 'project-1',
        superficieM2: 1000,
        ubicacionTexto: 'Santo Domingo',
      }
    } as any);

    vi.spyOn(useRulesApi, 'useRules').mockReturnValue({
      data: [
        {
          codigo: 'RULE-008-SUPERFICIE',
          nombre: 'Tolerancia Superficie vs Mensura',
          activa: false,
          valorUmbral: 0.05
        }
      ]
    } as any);

    const { result } = renderHook(() => useDiscrepancyCheck('project-1'));
    
    const discrepancies = result.current.checkDiscrepancies('plano-mensura', {
      superficieM2: 1500, // Should be 50% off, but rule is inactive
      designacionCatastral: 'DC-123'
    });

    // It should not find discrepancy for superficieM2 because rule is inactive
    const supDiscrepancy = discrepancies.find(d => d.field === 'superficieM2');
    expect(supDiscrepancy).toBeUndefined();
  });

  it('should trigger superficieM2 discrepancy for plano-mensura when RULE-008-SUPERFICIE is active', () => {
    vi.spyOn(useProjectsApi, 'useProject').mockReturnValue({
      data: {
        id: 'project-1',
        superficieM2: 1000,
        ubicacionTexto: 'Santo Domingo',
      }
    } as any);

    vi.spyOn(useRulesApi, 'useRules').mockReturnValue({
      data: [
        {
          codigo: 'RULE-008-SUPERFICIE',
          nombre: 'Tolerancia Superficie vs Mensura',
          activa: true,
          valorUmbral: 0.05
        }
      ]
    } as any);

    const { result } = renderHook(() => useDiscrepancyCheck('project-1'));
    
    const discrepancies = result.current.checkDiscrepancies('plano-mensura', {
      superficieM2: 1500, // 50% off, greater than 0.05
      designacionCatastral: 'DC-123'
    });

    const supDiscrepancy = discrepancies.find(d => d.field === 'superficieM2');
    expect(supDiscrepancy).toBeDefined();
    expect(supDiscrepancy?.field).toBe('superficieM2');
  });
});
