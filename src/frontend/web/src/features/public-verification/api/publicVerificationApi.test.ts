import { describe, it, expect, vi } from "vitest";
import { publicVerificationApi } from "./publicVerificationApi";
import { isSuccess } from "../../../shared/utils/functional";

// Mocking import.meta.env
vi.stubEnv("VITE_USE_MOCK", "true");
vi.stubEnv("VITE_API_URL", "http://localhost:5000/api");

describe("publicVerificationApi Search Coverage", () => {
  
  it("should find valid project by Suelo number (DC-12345)", async () => {
    const result = await publicVerificationApi.verifyCode("DC-12345", "suelo");
    
    expect(isSuccess(result)).toBe(true);
    if (isSuccess(result)) {
      expect(result.data).not.toBeNull();
      expect(result.data?.projectName).toBe("Residencial Las Palmas");
      expect(result.data?.numSuelo).toBe("DC-12345");
    }
  });

  it("should find valid project by RNC (101-23456-1)", async () => {
    const result = await publicVerificationApi.verifyCode("101-23456-1", "rnc");
    
    expect(isSuccess(result)).toBe(true);
    if (isSuccess(result)) {
      expect(result.data).not.toBeNull();
      expect(result.data?.projectName).toBe("Residencial Las Palmas");
      expect(result.data?.rnc).toBe("101-23456-1");
    }
  });

  it("should find valid project by IPI certificate (IPI-2026-9901)", async () => {
    const result = await publicVerificationApi.verifyCode("IPI-2026-9901", "ipi");
    
    expect(isSuccess(result)).toBe(true);
    if (isSuccess(result)) {
      expect(result.data).not.toBeNull();
      expect(result.data?.projectName).toBe("Residencial Las Palmas");
      expect(result.data?.ipi).toBe("IPI-2026-9901");
    }
  });

  it("should find valid project by Cédula (001-2233445-6)", async () => {
    const result = await publicVerificationApi.verifyCode("001-2233445-6", "ced");
    
    expect(isSuccess(result)).toBe(true);
    if (isSuccess(result)) {
      expect(result.data).not.toBeNull();
      expect(result.data?.projectName).toBe("Torre Bella Vista");
      expect(result.data?.cedula).toBe("001-2233445-6");
    }
  });

  it("should find valid project by VeriFinca Sello (VF-2026-X83L)", async () => {
    const result = await publicVerificationApi.verifyCode("VF-2026-X83L", "cert");
    
    expect(isSuccess(result)).toBe(true);
    if (isSuccess(result)) {
      expect(result.data).not.toBeNull();
      expect(result.data?.publicCode).toBe("VF-2026-X83L");
    }
  });

  it("should return null when code is invalid or not found", async () => {
    const result = await publicVerificationApi.verifyCode("INVALID-CODE-999", "cert");
    expect(isSuccess(result)).toBe(true);
    if (isSuccess(result)) {
      expect(result.data).toBeNull();
    }
  });

  it("should find valid project by Cédula string 'cedula' (001-2233445-6)", async () => {
    const result = await publicVerificationApi.verifyCode("001-2233445-6", "cedula");
    expect(isSuccess(result)).toBe(true);
    if (isSuccess(result)) {
      expect(result.data).not.toBeNull();
      expect(result.data?.projectName).toBe("Torre Bella Vista");
      expect(result.data?.isRegistered).toBe(true);
    }
  });

  it("should return simulated unregistered profile for valid format not in db (Cédula: 402-9999999-9)", async () => {
    const result = await publicVerificationApi.verifyCode("402-9999999-9", "cedula");
    expect(isSuccess(result)).toBe(true);
    if (isSuccess(result)) {
      expect(result.data).not.toBeNull();
      expect(result.data?.isRegistered).toBe(false);
      expect(result.data?.projectName).toBe("Persona Física No Registrada");
      expect(result.data?.integrityStatus).toBe("No Registrado");
    }
  });

  it("should return null when type and code don't match (Search RNC using Suelo code)", async () => {
    const result = await publicVerificationApi.verifyCode("DC-12345", "rnc");
    expect(isSuccess(result)).toBe(true);
    if (isSuccess(result)) {
      expect(result.data).toBeNull();
    }
  });

});
