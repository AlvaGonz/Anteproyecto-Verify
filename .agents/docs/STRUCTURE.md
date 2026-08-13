# STRUCTURE.md ?" VeriFinca Codebase Map

## Global Topology
- **16,118 nodes** and **35,179 edges** identified in the project graph.

## Directory Tree & Layers
- `src/backend/`: Clean Architecture (.NET)
  - `Api/` (Layer: api) - HTTP Route definitions and Program entry points.
  - `Application/` - Business logic, DTOs, Handlers.
  - `Domain/` - Entities, Enums, ValueObjects.
  - `Infrastructure/` - Persistence, Security, OCR stubs, Services.
- `src/frontend/web/`: React frontend (Layer: entry)
  - `src/features/` - Domain-driven feature slicing (audit, etc.).
  - `src/app/`, `src/components/`, `src/shared/`.
- `src/microservices/paddleocr-api/`: Python microservice providing OCR capabilities.
- `tests/`: 
  - `backend/IntegrationTests/`
  - `backend/UnitTests/`
- `Bots/`: External system crawlers (DGII, Mived Licencias).
- `e2e/`: Playwright end-to-end tests.
- `evals/`: Harnesses and prompt evaluations.
- `.agents/`: Automation scripts and documentation (PWF, ADRs).

*Generated via codebase-memory-mcp architectural analysis.*
