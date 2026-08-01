import {
  TwoFactorErrorCode,
  type TwoFactorErrorCodeValue,
} from "./twoFactorErrorCodes";

export { TwoFactorErrorCode };
export type { TwoFactorErrorCodeValue };

export const ERROR_CATALOG: Record<TwoFactorErrorCodeValue, string> = {
  ENROLLMENT_BEGIN_FAILED:
    "No se pudo completar la activación en este momento. Intente nuevamente.",
  ENROLLMENT_ALREADY_ACTIVE:
    "Ya tiene una inscripción en curso. Cancele o confirme la inscripción actual.",
  ENROLLMENT_CONFIRM_FAILED:
    "No se pudo completar la activación en este momento. Intente nuevamente.",
  NO_PENDING_ENROLLMENT:
    "No hay una inscripción pendiente. Inicie una inscripción primero.",
  TOTP_INVALID_CODE: "Código inválido o vencido. Intente de nuevo.",
  TOTP_LOCKED_OUT:
    "Demasiados intentos. Espere unos minutos antes de intentar nuevamente.",
  RECOVERY_CODE_INVALID: "Código de recuperación inválido o ya utilizado.",
  RECOVERY_CODE_LOCKED_OUT:
    "Demasiados intentos. Espere unos minutos antes de intentar nuevamente.",
  EMAIL_OTP_REQUEST_FAILED:
    "No se pudo enviar el código por correo. Intente nuevamente en unos minutos.",
  EMAIL_OTP_INVALID: "Código de correo inválido o vencido. Intente de nuevo.",
  EMAIL_OTP_LOCKED_OUT:
    "Demasiados intentos. Espere unos minutos antes de intentar nuevamente.",
  EMAIL_OTP_RESEND_THROTTLED:
    "Debes esperar un momento antes de solicitar otro código.",
  DISABLE_FAILED:
    "No se pudo desactivar la verificación en este momento. Intente nuevamente.",
  QR_RENDER_FAILED:
    "No se pudo generar el código QR. Puede usar la clave secreta manualmente.",
  STATUS_LOAD_FAILED:
    "No se pudo cargar el estado de verificación. Intente nuevamente.",
  NETWORK_ERROR:
    "No se pudo completar la solicitud. Verifique su conexión e intente de nuevo.",
  UNKNOWN: "No se pudo completar la solicitud. Intente nuevamente.",
};

export function safeMessageFor(code: TwoFactorErrorCodeValue): string {
  return ERROR_CATALOG[code] ?? ERROR_CATALOG[TwoFactorErrorCode.UNKNOWN];
}

const KNOWN_CODES = new Set<TwoFactorErrorCodeValue>(
  Object.values(TwoFactorErrorCode),
);

export interface TwoFactorError {
  code: TwoFactorErrorCodeValue;
  message: string;
  correlationId?: string;
}

function isAxiosLike(value: unknown): value is { response?: { status?: number; data?: unknown }; message?: string } {
  return typeof value === "object" && value !== null;
}

export function toTwoFactorError(err: unknown): TwoFactorError {
  if (!isAxiosLike(err)) {
    return {
      code: TwoFactorErrorCode.UNKNOWN,
      message: safeMessageFor(TwoFactorErrorCode.UNKNOWN),
    };
  }

  const response = err.response;
  const data = (response?.data ?? {}) as { code?: unknown; correlationId?: unknown };
  const rawCode = typeof data.code === "string" ? data.code : undefined;
  const correlationId = typeof data.correlationId === "string" ? data.correlationId : undefined;

  if (rawCode && (KNOWN_CODES as Set<string>).has(rawCode)) {
    const code = rawCode as TwoFactorErrorCodeValue;
    return { code, message: safeMessageFor(code), correlationId };
  }

  if (!response) {
    return {
      code: TwoFactorErrorCode.NETWORK_ERROR,
      message: safeMessageFor(TwoFactorErrorCode.NETWORK_ERROR),
    };
  }

  return {
    code: TwoFactorErrorCode.UNKNOWN,
    message: safeMessageFor(TwoFactorErrorCode.UNKNOWN),
    correlationId,
  };
}
