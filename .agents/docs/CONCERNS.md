# CONCERNS.md — VeriFinca Codebase Map

## Codebase Hotspots (High Fan-In)
- **`UnitOfWork.SaveChangesAsync`** (fan_in: ~97 direct call sites in production [72 in Application, 25 in Infrastructure], ~140 in tests, 298 transitive graph paths):
  - *Consolidation Status (Phase 2)*: `ProjectService.CreateProjectAsync` consolidated to stage `Proyecto` and initial status `Auditoria` in memory before a single atomic `SaveChangesAsync()` commit. Post-commit notifications are dispatched strictly after successful persistence.
- **`Coordenadas.ToString`** (fan_in: 73): Widespread utilization of spatial/coordinate formatting.
- **`EmailOtpService.Handle`** (fan_in: 50): High dependency on email OTP handling across the system.
- **`Proyecto` & `Usuario` Entities** (fan_in: 43 & 39): Core domain objects central to the system.

## Architectural Boundaries to Monitor
- **Mived / DGII Bot Coupling:** External Python bots rely heavily on string parsing (`str`, `print`, `list`) representing potential brittle parsing logic.
- **Frontend-Backend Coupling:** 8 distinct integration points identified between frontend entry and backend core.
- **OCR Stub:** The `paddleocr-api` is a stub for development; ensure production environments correctly shift to Azure Document Intelligence (ADR-002).
- **Transaction vs Side-Effects Boundary:** Project and audit persistence are atomic in the local SQL Server transaction. Notifications and external service calls are post-commit side effects.

*Generated via codebase-memory-mcp architectural analysis & SQL profiling.*
