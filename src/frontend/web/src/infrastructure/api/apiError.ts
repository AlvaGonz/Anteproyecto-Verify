// Matches TRD §9 Standard Error Envelope
export interface ApiError {
  type: string;
  title: string;
  status: number;
  detail: string;
  traceId: string;
  errors?: Record<string, string[]>;
}

export function isApiError(error: unknown): error is { response: { data: ApiError } } {
  return (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as any).response?.data?.status === "number"
  );
}
