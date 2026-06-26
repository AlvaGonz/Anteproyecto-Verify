import { useState, useCallback } from 'react';

/**
 * Custom hook for handling Dominican Republic phone number input.
 * Provides auto-formatting to (XXX) XXX-XXXX and validates RD codes (809, 829, 849).
 * 
 * @param initialValue - Initial phone number value (can be formatted or unformatted)
 * @param onChange - Optional callback to notify of value changes (receives formatted value)
 * @returns Object with formatted value, raw digits, validation status, and change handler
 */
export function usePhoneInput(initialValue: string = '', onChange?: (value: string) => void) {
  const [value, setValue] = useState(initialValue);

  /**
   * Extracts only digits from a string
   */
  const getDigits = (str: string): string => str.replace(/\D/g, '');

  /**
   * Formats digits to (XXX) XXX-XXXX
   */
  const formatPhoneNumber = (digits: string): string => {
    if (!digits) return '';
    
    // Take only first 10 digits
    const cleanDigits = digits.slice(0, 10);
    
    if (cleanDigits.length <= 3) {
      return `(${cleanDigits}`;
    }
    
    if (cleanDigits.length <= 6) {
      return `(${cleanDigits.slice(0, 3)}) ${cleanDigits.slice(3)}`;
    }
    
    return `(${cleanDigits.slice(0, 3)}) ${cleanDigits.slice(3, 6)}-${cleanDigits.slice(6)}`;
  };

  /**
   * Validates if the digits represent a valid RD phone number
   * (starts with 809, 829, or 849 and has exactly 10 digits)
   */
  const isValidRDPhone = (digits: string): boolean => {
    return /^(809|829|849)\d{7}$/.test(digits);
  };

  /**
   * Handles input changes: formats, validates, updates state, and calls onChange
   */
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const digits = getDigits(inputValue);
    
    // Limit to 10 digits
    const limitedDigits = digits.slice(0, 10);
    const formatted = formatPhoneNumber(limitedDigits);
    
    setValue(formatted);
    onChange?.(formatted);
  }, [onChange]);

  /**
   * Resets the phone number value
   */
  const reset = useCallback((newValue: string = '') => {
    setValue(newValue);
    onChange?.(newValue);
  }, [onChange]);

  const digits = getDigits(value);
  const isValid = isValidRDPhone(digits) && digits.length === 10;

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