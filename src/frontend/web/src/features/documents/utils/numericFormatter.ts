/**
 * Numeric formatter for Certificado de Título extraction display.
 *
 * - Matrícula: digit-only integer (preserves leading zeros), no thousands
 *   separator (e.g. "0100035082" stays "0100035082").
 * - Superficie M²: decimal number, US thousands separator with 2 decimal places
 *   (e.g. "2000" → "2,000.00", "168.00" → "168.00").
 *
 * Matrícula must not contain commas; Superficie M² uses US notation (comma as
 * thousands separator). Non-digit characters in the raw OCR output (e.g.
 * "010-003-5082", "168.00 m²") are stripped before formatting so the same
 * field can be displayed whether the value came from the OCR pipeline or was
 * typed manually by the validator.
 */

const stripNonDigits = (value: string): string => (value ?? '').replace(/\D+/g, '');

const stripNonNumeric = (value: string): string => {
  if (!value) return '';
  return value.replace(/[^0-9.]/g, '');
};

export const formatMatricula = (raw: string | null | undefined): string => {
  if (!raw) return '';
  // Preserve leading zeros, no thousands separator.
  return stripNonDigits(raw);
};

export const formatSuperficieM2 = (raw: string | null | undefined): string => {
  if (!raw) return '';
  const cleaned = stripNonNumeric(raw);
  if (!cleaned) return '';
  const num = Number(cleaned);
  if (!isFinite(num)) return '';
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const isNumericMatricula = (raw: string | null | undefined): boolean => {
  if (raw === null || raw === undefined) return false;
  const trimmed = String(raw).trim();
  if (trimmed.length === 0) return false;
  return /^[0-9]+$/.test(trimmed);
};

export const isNumericSuperficieM2 = (raw: string | null | undefined): boolean => {
  if (raw === null || raw === undefined) return false;
  const trimmed = String(raw).trim();
  if (trimmed.length === 0) return false;
  return /^[0-9]+(\.[0-9]+)?$/.test(trimmed);
};
