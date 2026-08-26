import { describe, it, expect } from "vitest";
import { calculateConfidenceLevel } from "../confidenceLevel";
import { DocumentType, DocumentStatus } from "../../types";

describe("calculateConfidenceLevel", () => {
  it("returns 0 when documents array is empty or undefined", () => {
    expect(calculateConfidenceLevel([])).toBe(0);
    expect(calculateConfidenceLevel(undefined as any)).toBe(0);
  });

  it("calculates 42% for 2 essentials (32%) + 1 anexo (10%)", () => {
    const docs = [
      { tipoDocumento: DocumentType.CertificadoTitulo, estadoDocumento: DocumentStatus.Uploaded },
      { tipoDocumento: DocumentType.CertificacionEstadoJuridico, estadoDocumento: DocumentStatus.Uploaded },
      { tipoDocumento: DocumentType.CertificadoUsoSuelo, estadoDocumento: DocumentStatus.Uploaded },
    ];
    // 2/5 * 80 = 32, 1/2 * 20 = 10 -> 42%
    expect(calculateConfidenceLevel(docs)).toBe(42);
  });

  it("calculates 80% when all 5 essential document types are present", () => {
    const docs = [
      { tipoDocumento: DocumentType.CertificadoTitulo, estadoDocumento: DocumentStatus.Uploaded },
      { tipoDocumento: DocumentType.CertificacionEstadoJuridico, estadoDocumento: DocumentStatus.Uploaded },
      { tipoDocumento: DocumentType.PlanoMensuraCatastral, estadoDocumento: DocumentStatus.Uploaded },
      { tipoDocumento: DocumentType.ID, estadoDocumento: DocumentStatus.Uploaded },
      { tipoDocumento: DocumentType.CertificacionIPI, estadoDocumento: DocumentStatus.Uploaded },
    ];
    expect(calculateConfidenceLevel(docs)).toBe(80);
  });

  it("calculates 100% when all 5 essential + 2 visible annex documents are present", () => {
    const docs = [
      { tipoDocumento: DocumentType.CertificadoTitulo, estadoDocumento: DocumentStatus.Uploaded },
      { tipoDocumento: DocumentType.CertificacionEstadoJuridico, estadoDocumento: DocumentStatus.Uploaded },
      { tipoDocumento: DocumentType.PlanoMensuraCatastral, estadoDocumento: DocumentStatus.Uploaded },
      { tipoDocumento: DocumentType.ID, estadoDocumento: DocumentStatus.Uploaded },
      { tipoDocumento: DocumentType.CertificacionIPI, estadoDocumento: DocumentStatus.Uploaded },
      { tipoDocumento: DocumentType.CertificadoUsoSuelo, estadoDocumento: DocumentStatus.Uploaded },
      { tipoDocumento: DocumentType.PoderNotarial, estadoDocumento: DocumentStatus.Uploaded },
    ];
    expect(calculateConfidenceLevel(docs)).toBe(100);
  });

  it("handles legacy document types correctly (TITLE, LEGAL_STATUS, SURVEY, NOTARIAL_POWER)", () => {
    const docs = [
      { tipoDocumento: DocumentType.TITLE, estadoDocumento: DocumentStatus.Uploaded },
      { tipoDocumento: DocumentType.LEGAL_STATUS, estadoDocumento: DocumentStatus.Uploaded },
      { tipoDocumento: DocumentType.NOTARIAL_POWER, estadoDocumento: DocumentStatus.Uploaded },
    ];
    // 2 essentials (TITLE + LEGAL_STATUS = 32%) + 1 anexo (NOTARIAL_POWER = 10%) = 42%
    expect(calculateConfidenceLevel(docs)).toBe(42);
  });

  it("ignores documents with Invalid status", () => {
    const docs = [
      { tipoDocumento: DocumentType.CertificadoTitulo, estadoDocumento: DocumentStatus.Invalid },
      { tipoDocumento: DocumentType.CertificacionEstadoJuridico, estadoDocumento: DocumentStatus.Uploaded },
      { tipoDocumento: DocumentType.CertificadoUsoSuelo, estadoDocumento: DocumentStatus.Uploaded },
    ];
    // 1 essential (16%) + 1 anexo (10%) = 26%
    expect(calculateConfidenceLevel(docs)).toBe(26);
  });

  it("counts unique document types only once", () => {
    const docs = [
      { tipoDocumento: DocumentType.CertificadoTitulo, estadoDocumento: DocumentStatus.Uploaded },
      { tipoDocumento: DocumentType.CertificadoTitulo, estadoDocumento: DocumentStatus.Uploaded },
      { tipoDocumento: DocumentType.TITLE, estadoDocumento: DocumentStatus.Uploaded },
    ];
    // 1 unique essential = 16%
    expect(calculateConfidenceLevel(docs)).toBe(16);
  });
});
