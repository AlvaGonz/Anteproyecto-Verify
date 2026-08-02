// ponytail: tiny shared helper for 6-digit TOTP/OTP input filtering.
export const sanitizeDigits = (value: string, maxLength: number): string =>
  value.replace(/\D/g, "").slice(0, maxLength);
