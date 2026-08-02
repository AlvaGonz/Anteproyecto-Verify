import { describe, it, expect } from "vitest";
import {
  toTwoFactorError,
  TwoFactorErrorCode,
  safeMessageFor,
} from "../twoFactorErrorMap";

describe("twoFactorErrorMap", () => {
  it("maps backend code TOTP_INVALID_CODE to safe Spanish message", () => {
    expect(safeMessageFor(TwoFactorErrorCode.TOTP_INVALID_CODE)).toBe(
      "Código inválido o vencido. Intente de nuevo.",
    );
  });

  it("maps TOTP_LOCKED_OUT to a generic lockout message (no leaked internals)", () => {
    expect(safeMessageFor(TwoFactorErrorCode.TOTP_LOCKED_OUT)).toBe(
      "Demasiados intentos. Espere unos minutos antes de intentar nuevamente.",
    );
    expect(safeMessageFor(TwoFactorErrorCode.TOTP_LOCKED_OUT)).not.toMatch(/2FA|TOTP|account/i);
  });

  it("maps QR_RENDER_FAILED to a fallback-friendly message", () => {
    expect(safeMessageFor(TwoFactorErrorCode.QR_RENDER_FAILED)).toBe(
      "No se pudo generar el código QR. Puede usar la clave secreta manualmente.",
    );
  });

  it("maps ENROLLMENT_BEGIN_FAILED to safe generic message", () => {
    expect(safeMessageFor(TwoFactorErrorCode.ENROLLMENT_BEGIN_FAILED)).toBe(
      "No se pudo completar la activación en este momento. Intente nuevamente.",
    );
  });

  it("maps NETWORK_ERROR to connectivity message", () => {
    expect(safeMessageFor(TwoFactorErrorCode.NETWORK_ERROR)).toBe(
      "No se pudo completar la solicitud. Verifique su conexión e intente de nuevo.",
    );
  });

  it("maps UNKNOWN to a safe fallback (never leaks internal strings)", () => {
    const m = safeMessageFor(TwoFactorErrorCode.UNKNOWN);
    expect(m).toBe("No se pudo completar la solicitud. Intente nuevamente.");
    expect(m).not.toMatch(/stack|exception|null|SQL|column|FOREIGN|jwt|secret/i);
  });

  it("toTwoFactorError extracts code from a 423 axios response", () => {
    const err = {
      response: { status: 423, data: { code: "TOTP_LOCKED_OUT", correlationId: "abc" } },
      message: "internal stack trace 0xBAD",
    };
    const result = toTwoFactorError(err);
    expect(result.code).toBe(TwoFactorErrorCode.TOTP_LOCKED_OUT);
    expect(result.correlationId).toBe("abc");
    expect(result.message).toBe(
      "Demasiados intentos. Espere unos minutos antes de intentar nuevamente.",
    );
  });

  it("toTwoFactorError extracts code from a 400 axios response", () => {
    const err = {
      response: { status: 400, data: { code: "TOTP_INVALID_CODE" } },
      message: "we should never see this",
    };
    const result = toTwoFactorError(err);
    expect(result.code).toBe(TwoFactorErrorCode.TOTP_INVALID_CODE);
    expect(result.message).toBe("Código inválido o vencido. Intente de nuevo.");
  });

  it("toTwoFactorError falls back to UNKNOWN for missing code and NEVER returns backend message", () => {
    const err = {
      response: { status: 500, data: { detail: "SqlException: Column 'Id' cannot be null" } },
      message: "should be replaced",
    };
    const result = toTwoFactorError(err);
    expect(result.code).toBe(TwoFactorErrorCode.UNKNOWN);
    expect(result.message).not.toMatch(/SqlException|column|null/i);
    expect(result.message).toBe("No se pudo completar la solicitud. Intente nuevamente.");
  });

  it("toTwoFactorError handles network errors (no response) as NETWORK_ERROR", () => {
    const result = toTwoFactorError({ message: "Network Error" });
    expect(result.code).toBe(TwoFactorErrorCode.NETWORK_ERROR);
  });
});
