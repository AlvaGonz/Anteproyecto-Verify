import { describe, it, expect } from 'vitest';
import {
  formatMatricula,
  formatSuperficieM2,
  isNumericMatricula,
  isNumericSuperficieM2,
} from '../numericFormatter';

describe('numericFormatter', () => {
  describe('formatMatricula', () => {
    it('preserves leading zeros without thousands separator', () => {
      expect(formatMatricula('0100035082')).toBe('0100035082');
    });

    it('keeps 7-digit matricula unchanged', () => {
      expect(formatMatricula('1234567')).toBe('1234567');
    });

    it('keeps 5-digit matricula unchanged', () => {
      expect(formatMatricula('12345')).toBe('12345');
    });

    it('returns empty string for null/undefined/empty', () => {
      expect(formatMatricula('')).toBe('');
      expect(formatMatricula(null as unknown as string)).toBe('');
      expect(formatMatricula(undefined as unknown as string)).toBe('');
    });

    it('strips non-digit characters before formatting', () => {
      expect(formatMatricula('010-003-5082')).toBe('0100035082');
      expect(formatMatricula('010.003.5082')).toBe('0100035082');
    });
  });

  describe('formatSuperficieM2', () => {
    it('formats integer with US thousands separator and 2 decimals', () => {
      expect(formatSuperficieM2('2000')).toBe('2,000.00');
    });

    it('formats large number with multiple separators', () => {
      expect(formatSuperficieM2('2000000')).toBe('2,000,000.00');
    });

    it('preserves existing decimals when present', () => {
      expect(formatSuperficieM2('168.50')).toBe('168.50');
    });

    it('formats small decimals to 2 places', () => {
      expect(formatSuperficieM2('5')).toBe('5.00');
    });

    it('returns empty string for null/undefined/empty', () => {
      expect(formatSuperficieM2('')).toBe('');
      expect(formatSuperficieM2(null as unknown as string)).toBe('');
      expect(formatSuperficieM2(undefined as unknown as string)).toBe('');
    });

    it('strips non-numeric chars (letters, symbols) before formatting', () => {
      expect(formatSuperficieM2('168.00m²')).toBe('168.00');
      expect(formatSuperficieM2('500 mts')).toBe('500.00');
    });
  });

  describe('isNumericMatricula', () => {
    it('returns true for digits-only strings', () => {
      expect(isNumericMatricula('0100035082')).toBe(true);
      expect(isNumericMatricula('12345')).toBe(true);
    });

    it('returns false for non-digit characters', () => {
      expect(isNumericMatricula('01000A35082')).toBe(false);
      expect(isNumericMatricula('01000-35082')).toBe(false);
      expect(isNumericMatricula('01000.35082')).toBe(false);
      expect(isNumericMatricula('')).toBe(false);
    });
  });

  describe('isNumericSuperficieM2', () => {
    it('returns true for numeric strings including decimals', () => {
      expect(isNumericSuperficieM2('168.00')).toBe(true);
      expect(isNumericSuperficieM2('2000')).toBe(true);
      expect(isNumericSuperficieM2('5.5')).toBe(true);
    });

    it('returns false for non-numeric strings', () => {
      expect(isNumericSuperficieM2('168 m2')).toBe(false);
      expect(isNumericSuperficieM2('168.00m²')).toBe(false);
      expect(isNumericSuperficieM2('')).toBe(false);
    });
  });
});
