import { useState, useCallback } from 'react';

/**
 * Extracts only digits from a string
 */
const getDigits = (str: string): string => str.replace(/\D/g, '');

/**
 * Formats digits to XXX-XXXXXXX-X
 */
const formatCedula = (digits: string): string => {
  if (!digits) return '';
  const cleanDigits = digits.slice(0, 11);
  if (cleanDigits.length <= 3) return cleanDigits;
  if (cleanDigits.length <= 10) return `${cleanDigits.slice(0, 3)}-${cleanDigits.slice(3)}`;
  return `${cleanDigits.slice(0, 3)}-${cleanDigits.slice(3, 10)}-${cleanDigits.slice(10, 11)}`;
};

/**
 * Validates if the digits represent a valid RD cédula (exactly 11 digits)
 */
const isValidCedula = (digits: string): boolean => /^\d{11}$/.test(digits);

/**
 * Custom hook for handling Dominican Republic cédula input.
 * Provides auto-formatting to XXX-XXXXXXX-X and validates.
 * 
 * @param initialValue - Initial cédula value (can be formatted or unformatted)
 * @param onChange - Optional callback to notify of value changes (receives formatted value)
 * @returns Object with formatted value, raw digits, validation status, and change handler
 */
export function useCedulaInput(initialValue: string = '', onChange?: (value: string) => void) {
  const [value, setValue] = useState(initialValue);

  /**
   * Handles input changes: formats, validates, updates state, and calls onChange
   */
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const digits = getDigits(inputValue);

    // Limit to 11 digits
    const limitedDigits = digits.slice(0, 11);
    const formatted = formatCedula(limitedDigits);

    setValue(formatted);
    onChange?.(formatted);
  }, [onChange]);

  /**
   * Resets the cédula value
   */
  const reset = useCallback((newValue: string = '') => {
    setValue(newValue);
    onChange?.(newValue);
  }, [onChange]);

  const digits = getDigits(value);
  const isValid = isValidCedula(digits) && digits.length === 11;

  return {
    value: value || '',
    digits,
    isValid,
    handleChange,
    reset,
    /**
     * Returns the formatted value for display
     */
    formatted: value,
    /**
     * Returns the raw digits for submission to backend
     */
    rawDigits: digits,
  };
}