// @vitest-environment jsdom
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { AuditLogList } from "./AuditLogList";
import { AuditLogDto, AuditActionType } from "../../types";

const baseLog = (overrides: Partial<AuditLogDto>): AuditLogDto => ({
  id: "log-1",
  proyectoId: "proj-1",
  usuarioId: "user-1",
  usuarioNombre: "Usuario Test",
  accion: AuditActionType.StatusChange,
  descripcion: "Estado cambiado",
  fechaUtc: "2026-07-01T10:00:00Z",
  metadataJson: null,
  ipAddress: null,
  ...overrides,
});

describe("AuditLogList", () => {
  it("renderiza la fecha formateada cuando fechaUtc es válida", () => {
    render(<AuditLogList logs={[baseLog({})]} />);
    expect(screen.getByText(/7\/1\/2026/)).toBeInTheDocument();
  });

  it("no crashea cuando una entrada tiene fechaUtc null (datos reales de API)", () => {
    const log = baseLog({ fechaUtc: null as unknown as string });
    expect(() => render(<AuditLogList logs={[log]} />)).not.toThrow();
  });

  it("muestra un fallback legible cuando la fecha es null", () => {
    const log = baseLog({ fechaUtc: null as unknown as string });
    render(<AuditLogList logs={[log]} />);
    expect(screen.getByText(/fecha no disponible/i)).toBeInTheDocument();
    expect(screen.getByText("Estado cambiado")).toBeInTheDocument();
  });
});
