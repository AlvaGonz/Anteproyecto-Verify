import { describe, it, expect } from "vitest";
import { toleranceRuleSchema } from "../features/rules/api/useRules";
import { VALIDATION_RULES } from "../lib/validation-rules";

describe("Regla 8: Tolerancia Superficie vs Mensura", () => {
  describe("toleranceRuleSchema (Zod validation)", () => {
    it("debe validar valores dentro del rango legal permitido (1% a 20%)", () => {
      // 5% (default)
      const resDefault = toleranceRuleSchema.safeParse({
        valorUmbral: 0.05,
        nivelAlerta: "Advertencia",
        activa: true,
      });
      expect(resDefault.success).toBe(true);

      // 1% (min boundary)
      const resMin = toleranceRuleSchema.safeParse({
        valorUmbral: 0.01,
        nivelAlerta: "Advertencia",
        activa: true,
      });
      expect(resMin.success).toBe(true);

      // 20% (max boundary)
      const resMax = toleranceRuleSchema.safeParse({
        valorUmbral: 0.20,
        nivelAlerta: "Advertencia",
        activa: true,
      });
      expect(resMax.success).toBe(true);
    });

    it("debe rechazar valores inferiores a 1% (< 0.01)", () => {
      const res = toleranceRuleSchema.safeParse({
        valorUmbral: 0.005, // 0.5%
        nivelAlerta: "Advertencia",
        activa: true,
      });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.issues[0].message).toContain("mínima permitida es 1%");
      }
    });

    it("debe rechazar valores superiores a 20% (> 0.20)", () => {
      const res = toleranceRuleSchema.safeParse({
        valorUmbral: 0.25, // 25%
        nivelAlerta: "Advertencia",
        activa: true,
      });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.issues[0].message).toContain("máxima permitida es 20%");
      }
    });
  });

  describe("Cálculo matemático de discrepancia de superficie", () => {
    const calculateDeviation = (supProyecto: number, supCatastro: number) => {
      if (supCatastro <= 0) throw new Error("Catastro debe ser mayor a cero");
      const diff = Math.abs(supProyecto - supCatastro);
      return diff / supCatastro;
    };

    it("debe aceptar proyecto dentro del 5% de tolerancia (1000m² catastro vs 1040m² proyecto)", () => {
      const deviation = calculateDeviation(1040, 1000);
      expect(deviation).toBe(0.04);
      expect(deviation <= 0.05).toBe(true);
    });

    it("debe detectar discrepancia cuando excede el 5% (1000m² catastro vs 1080m² proyecto)", () => {
      const deviation = calculateDeviation(1080, 1000);
      expect(deviation).toBe(0.08);
      expect(deviation <= 0.05).toBe(false);
    });

    it("debe permitir que tolerancia del 10% acepte variación de 8%", () => {
      const customTolerance = 0.10;
      const deviation = calculateDeviation(1080, 1000);
      expect(deviation <= customTolerance).toBe(true);
    });

    it("debe evaluar correctamente variaciones por defecto en plano-mensura", () => {
      const rule = VALIDATION_RULES["plano-mensura"];
      expect(rule.matchStrategy).toBe("range");
      expect(rule.tolerance).toBe(0.05);
    });
  });
});
