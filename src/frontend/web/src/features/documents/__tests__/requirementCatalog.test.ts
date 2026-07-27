import { describe, it, expect } from "vitest";
import {
  getRequirementsForCategory,
  resolveRequirementStatus,
  BASE_REQUIREMENTS,
  RequirementDefinition
} from "../requirementCatalog";
import { DocumentDto, DocumentType, DocumentStatus } from "../types";

describe("requirementCatalog", () => {
  describe("getRequirementsForCategory", () => {
    it("returns base requirements plus Residencial requirements for category 1", () => {
      const reqs = getRequirementsForCategory(1);
      expect(reqs.length).toBe(BASE_REQUIREMENTS.length + 1);
      expect(reqs.find((r) => r.code === "REGIMEN_CONDOMINIO")).toBeDefined();
    });

    it("returns base requirements plus Comercial requirements for category 2", () => {
      const reqs = getRequirementsForCategory(2);
      expect(reqs.length).toBe(BASE_REQUIREMENTS.length + 2);
      expect(reqs.find((r) => r.code === "REGISTRO_SANITARIO")).toBeDefined();
      expect(reqs.find((r) => r.code === "IMPACTO_TRAFICO")).toBeDefined();
    });

    it("returns base requirements plus Turistico requirements for category 3", () => {
      const reqs = getRequirementsForCategory(3);
      expect(reqs.length).toBe(BASE_REQUIREMENTS.length + 1);
      expect(reqs.find((r) => r.code === "RESOLUCION_CONFOTUR")).toBeDefined();
    });

    it("returns base requirements plus Mixto requirements for category 4", () => {
      const reqs = getRequirementsForCategory(4);
      expect(reqs.length).toBe(BASE_REQUIREMENTS.length + 1);
      expect(reqs.find((r) => r.code === "RESOLUCION_ZONIFICACION")).toBeDefined();
    });

    it("returns only base requirements for category 99 (Otro)", () => {
      const reqs = getRequirementsForCategory(99);
      expect(reqs.length).toBe(BASE_REQUIREMENTS.length);
    });
  });

  describe("resolveRequirementStatus", () => {
    const mockRequirement: RequirementDefinition = {
      code: "TITULO_PROPIEDAD",
      label: "Título",
      description: "Desc",
      documentType: DocumentType.CertificadoTitulo,
      acceptedMimeTypes: "application/pdf",
      maxSizeBytes: 1000,
      required: true,
    };

    const mockOtherRequirement: RequirementDefinition = {
      code: "RESOLUCION_CONFOTUR",
      label: "CONFOTUR",
      description: "Desc",
      documentType: DocumentType.Other,
      acceptedMimeTypes: "application/pdf",
      maxSizeBytes: 1000,
      required: true,
    };

    it("returns 'missing' when no matching document exists", () => {
      const status = resolveRequirementStatus(mockRequirement, []);
      expect(status).toBe("missing");
    });

    it("returns 'optional' when no matching document exists and requirement is optional", () => {
      const status = resolveRequirementStatus({ ...mockRequirement, optional: true }, []);
      expect(status).toBe("optional");
    });

    it("returns 'missing' when matching document exists but is inactive", () => {
      const doc = {
        id: "1",
        tipoDocumento: DocumentType.CertificadoTitulo,
        activo: false,
        estadoDocumento: DocumentStatus.Uploaded
      } as DocumentDto;
      const status = resolveRequirementStatus(mockRequirement, [doc]);
      expect(status).toBe("missing");
    });

    it("returns 'uploaded' when matching active document exists", () => {
      const doc = {
        id: "1",
        tipoDocumento: DocumentType.CertificadoTitulo,
        activo: true,
        estadoDocumento: DocumentStatus.Uploaded
      } as DocumentDto;
      const status = resolveRequirementStatus(mockRequirement, [doc]);
      expect(status).toBe("uploaded");
    });

    it("returns 'invalid' when matching active document is marked invalid", () => {
      const doc = {
        id: "1",
        tipoDocumento: DocumentType.CertificadoTitulo,
        activo: true,
        estadoDocumento: DocumentStatus.Invalid
      } as DocumentDto;
      const status = resolveRequirementStatus(mockRequirement, [doc]);
      expect(status).toBe("invalid");
    });

    it("matches 'Other' document types correctly by checking observaciones", () => {
      const doc1 = {
        id: "1",
        tipoDocumento: DocumentType.Other,
        activo: true,
        estadoDocumento: DocumentStatus.Uploaded,
        observaciones: "RESOLUCION_CONFOTUR"
      } as DocumentDto;
      
      const doc2 = {
        id: "2",
        tipoDocumento: DocumentType.Other,
        activo: true,
        estadoDocumento: DocumentStatus.Uploaded,
        observaciones: "REGISTRO_SANITARIO"
      } as DocumentDto;

      const status1 = resolveRequirementStatus(mockOtherRequirement, [doc2]);
      expect(status1).toBe("missing");

      const status2 = resolveRequirementStatus(mockOtherRequirement, [doc1, doc2]);
      expect(status2).toBe("uploaded");
    });
  });
});
