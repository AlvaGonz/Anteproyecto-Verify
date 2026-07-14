/**
 * ponytail: SQL Server datetime2 strips DateTime.Kind on read.
 * EF Core returns DateTimeKind.Unspecified → System.Text.Json serializes WITHOUT 'Z'
 * → JS `new Date()` treats it as local time instead of UTC.
 *
 * This forces the UTC marker so JS converts correctly to the user's local timezone.
 */
export function toUtcDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  return new Date(value.endsWith('Z') || value.includes('+') ? value : value + 'Z');
}
