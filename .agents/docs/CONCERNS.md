# CONCERNS.md ?" VeriFinca Codebase Map

## Codebase Hotspots (High Fan-In)
- **`UnitOfWork.SaveChangesAsync`** (fan_in: 85): Critical central bottleneck/hub for all state changes.
- **`Coordenadas.ToString`** (fan_in: 73): Widespread utilization of spatial/coordinate formatting.
- **`EmailOtpService.Handle`** (fan_in: 50): High dependency on email OTP handling across the system.
- **`Proyecto` & `Usuario` Entities** (fan_in: 43 & 39): Core domain objects central to the system.

## Architectural Boundaries to Monitor
- **Mived / DGII Bot Coupling:** External Python bots rely heavily on string parsing (`str`, `print`, `list`) representing potential brittle parsing logic.
- **Frontend-Backend Coupling:** 8 distinct integration points identified between frontend entry and backend core.
- **OCR Stub:** The `paddleocr-api` is a stub for development; ensure production environments correctly shift to Azure Document Intelligence (ADR-002).

*Generated via codebase-memory-mcp architectural analysis.*
