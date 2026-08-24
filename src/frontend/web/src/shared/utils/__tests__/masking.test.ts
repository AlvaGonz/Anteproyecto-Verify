import { describe, it, expect } from "vitest";
import { maskCedula } from "../masking";

describe("maskCedula", () => {
  it("should mask a valid 11-digit Cedula with hyphens", () => {
    expect(maskCedula("402-2751075-2")).toBe("402-***1075-*");
  });

  it("should mask a valid 11-digit Cedula without hyphens", () => {
    expect(maskCedula("40227510752")).toBe("402-***1075-*");
  });

  it("should NOT mask a 9-digit RNC with hyphens", () => {
    expect(maskCedula("130-12345-6")).toBe("130-12345-6");
  });

  it("should NOT mask a 9-digit RNC without hyphens", () => {
    expect(maskCedula("130123456")).toBe("130123456");
  });

  it("should NOT mask alphanumeric strings of 11 characters", () => {
    expect(maskCedula("A02-2751075-B")).toBe("A02-2751075-B");
  });

  it("should return the same string if null, undefined, or empty", () => {
    expect(maskCedula("")).toBe("");
    expect(maskCedula(null as any)).toBe("");
    expect(maskCedula(undefined as any)).toBe("");
  });
});
