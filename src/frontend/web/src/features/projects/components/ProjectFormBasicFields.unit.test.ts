import { describe, it, expect } from 'vitest';
import { formatRncCedula } from './ProjectFormBasicFields';

describe('formatRncCedula', () => {
  it('formats 11 digit cedula correctly', () => {
    expect(formatRncCedula('40228600017')).toBe('402-2860001-7');
  });

  it('formats 9 digit RNC correctly', () => {
    expect(formatRncCedula('130123456')).toBe('1-30-12345-6');
  });

  it('keeps short inputs unformatted or partially formatted', () => {
    expect(formatRncCedula('1')).toBe('1');
    expect(formatRncCedula('13')).toBe('1-3');
  });

  it('strips non-digits', () => {
    expect(formatRncCedula('402-286A')).toBe('4-02-286');
  });
});
