# AGENTS.md — VeriFinca / Anteproyecto-Verify
> **Version:** 5.0.0 | **Date:** 2026-06-29 | **Status:** Active & Enforced
> **Proyecto de Grado:** Sistema web de verificación y autenticación integral de proyectos inmobiliarios para prevención de estafas financieras mediante la validación de documentación legal, financiera y de propiedad en la República Dominicana.
> **Universidad Central del Este — Escuela de Ingeniería de Software — Año 2026**

---

## 1. 🤖 CORE COLLABORATION RULES (MANDATORY)

These are the global expectations for all agents operating in this workspace.

1. **codebase-memory-mcp Bootstrap (NON-NEGOTIABLE)**
   > ⛔ **NO AGENT MAY WRITE, READ, MODIFY, OR DELETE ANY FILE WITHOUT FIRST COMPLETING THE BOOTSTRAP SEQUENCE.**
   - Run `get_architecture` (FIRST tool call of every session).
   - Run `get_graph_schema`.
   - Run `search_graph` before reading/editing any file.
   - Run `detect_changes` before any PR creation.
   - Run `trace_path` (Depth ≥ 3) before refactoring shared services.

2. **Role-Based Execution States**
   - **Role A (Architect):** System design, specs, Mermaid diagrams.
   - **Role B (Developer):** Context-bounded feature implementation.
   - **Role C (Reviewer):** Audits code against spec.
   - *No agent skips a stage.*

3. **Commit & Checkpoint Protocol**
   - Use atomic commits (commit after every logical step).
   - Prefix commits with the relevant RF or OE (e.g., `feat(rf-3): ...`, `test(oe-3): ...`).
   - Stop and revert if stuck in a loop for 3 attempts (Zombie Revert Prevention).
   - Never set a task as "done" until ALL related tests are green and you run `.agents/scripts/post_task_loop.py`.

4. **Agentic Memory (Unified Protocol)**
   - **After every session:** Update `@.agents/docs/PWF/progress.md`. Failure to do so invalidates the session.
   - Before coding, read `progress.md`, `TRD_VeriFinca.md`, `ARCHITECTURE.md`, and relevant rule files.

5. **Mermaid Architecture Enforcement**
   - No code before spec. Validate design against `ARCHITECTURE.md`.
   - Update C4/Sequence diagrams in `ARCHITECTURE.md` before committing structural changes.

6. **The MCP (Model Context Protocol) Mandate**
   - Do not guess schemas or tokens. Use `Azure SQL / DB MCP` for schema tasks, `Stitch MCP` for UI tokens, `GitHub MCP` for PR state.

---

## 2. 🗺️ RULE FILE MAP (Directional Includes)

This workspace modularizes its configuration. Do not load all rules at once. **You must load the relevant domain rules before starting work on a specific area.**

- **Real Estate Domain (`@.agents/rules/agents-real-estate.md`)**
  *When implementing OEs (1-7), Law 172-13, Law 126-02, or modifying `Project`/`Document` domain logic, always consult this file first.*

- **Security & DevSecOps (`@.agents/rules/agents-security.md`)**
  *Before modifying Auth logic, RBAC, Key Vault secrets, or making security-sensitive changes, follow these strict guardrails.*

- **Testing Protocols (`@.agents/rules/agents-testing.md`)**
  *When writing or debugging tests in xUnit, Vitest, or Playwright, refer to this file for coverage requirements and quirks.*

---

## 3. 🏗️ GLOBAL PROJECT STRUCTURE & QUICK START

**Monorepo Layout:**
| Stack | Location | Tech |
|-------|----------|------|
| Backend API | `src/backend/` | ASP.NET Core 8, Clean Architecture |
| Frontend web | `src/frontend/web/` | React 19, TypeScript, Vite 6, Tailwind 4 |

**Quick Start (Docker):**
```bash
docker compose up -d
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`
- SQL Server: `localhost:1433`

**Package Manager:**
- Use `pnpm` (v9+) from the root context or in `src/frontend/web`.

**Database Migration:**
```bash
cd src/backend
dotnet ef migrations add <Name> --project Infrastructure/Infrastructure.csproj --startup-project Api/Api.csproj --output-dir Persistence/Migrations
```