import { describe, it, expect } from 'vitest';
import { formatRncCedula } from './ProjectFormBasicFields';

describe('formatRncCedula', () => {
  it('formats 11 digit cedula correctly', () => {
    expect(formatRncCedula('40228600017')).toBe('402-2860001-7');
  });

  it('formats 9 digit RNC correctly', () => {
    expect(formatRncCedula('130123456')).toBe('130-12345-6');
  });

  it('keeps short inputs unformatted or partially formatted', () => {
    expect(formatRncCedula('130')).toBe('130');
    expect(formatRncCedula('13012')).toBe('130-12');
  });

  it('strips non-digits', () => {
    expect(formatRncCedula('402-286A')).toBe('402-286');
  });
});
