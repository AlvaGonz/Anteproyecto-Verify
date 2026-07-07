---
trigger: always_on
---

# Testing Protocol Rules

> Skills: `test-driven-development` · `vitest` · `quality-qa` · `playwright-generate-test` · `playwright-skill`
> Reference: `AGENTS.md` TDD protocol · `TRD §2.3–2.4` · `TRD §12.2` · `ARCHITECTURE.md §9`

---

## 1. TDD Is Mandatory (Red → Green → Refactor)

All features and bug fixes MUST follow strict TDD:

1. Write a failing test **first** (unit or integration, depending on scope).
2. Run the test suite and confirm it fails for the expected reason.
3. Implement the minimal code change to make the test pass.
4. Refactor only after tests are green.
5. Commit only when **all** tests are passing.

- Forbidden:
  - Writing implementation code without a new or updated failing test.
  - Changing logic and “fixing tests later”.
- Required local command before any commit:
  ```bash
  dotnet test # backend
  pnpm test   # or equivalent for SPA unit tests
  ```

---

## 2. Test Pyramid — What Goes Where

You MUST respect the test pyramid and choose the lowest layer that can fully validate the behavior.

### 2.1 Backend

- **Unit tests** (`VeriFinca.Tests.Unit`):
  - Scope: pure Domain and Application logic (entities, value objects, MediatR handlers, rules engine, CertificationEngine guards).
  - Use: xUnit + Moq.
  - No DB, no HTTP, no Azure SDKs.

- **Integration tests** (`VeriFinca.Tests.Integration`):
  - Scope: EF Core, AppDbContext, repositories, external API clients via WireMock.NET, Service Bus interactions via TestContainers.
  - DO NOT mock HTTP or SQL — use test containers and WireMock stubs.

- **Security tests**:
  - For every new endpoint or business rule, add at least one negative-path security test (IDOR, missing consent, role violations) following TRD’s “Failing-Security-Test-First Loop”.

### 2.2 Frontend (React 19 SPA)

- **Unit / component tests** (Vitest):
  - Scope: pure components, hooks, and utility functions.
  - Use: Vitest + Testing Library.
  - Do not hit real backend; use mocked TanStack Query clients or MSW.

- **E2E tests** (Playwright):
  - Scope: end-to-end flows across SPA + API + infrastructure (staging slot).
  - Use: Playwright scripts checking critical flows (register project, upload docs, trigger validation, issue seal, verify seal).

---

## 3. Coverage and Gates

### 3.1 Backend Coverage

- Minimum **80% line coverage** on:
  - `VeriFinca.Domain`
  - `VeriFinca.Application`

This is a **hard gate**: CI step `dotnet test` with coverage enforcement must fail if coverage drops below 80% for these layers.

- Agents MUST:
  - Add tests whenever they add a branch, guard, or new handler.
  - Avoid logic in controllers or Infrastructure that bypasses testable Application and Domain logic.

### 3.2 Frontend Coverage

- Vitest test suites must run on every PR.
- Any new component, hook, or critical UI flow must ship with at least:
  - One happy-path test.
  - One failure/edge test (validation, error state, loading state).

---

## 4. Playwright E2E & Smoke Tests

### 4.1 Required Playwright Scenarios

At minimum, maintain Playwright tests for:

1. **Developer happy path**:
   - Login → register project → upload all required documents → see diagnosis.
2. **Validator flow**:
   - Login as VALIDATOR → trigger validations → see results.
3. **Seal issuance**:
   - Admin login → issue seal → QR code visible.
4. **Public verification**:
   - Access `GET /public/verifyseal/{id}` via SPA → see seal status.

- Any new critical path in TRD must add or update a Playwright test.

### 4.2 Staging Slot Swap Guard

Before swapping staging → production:

1. Deploy to staging slot.
2. Run headless Playwright smoke suite against staging base URL.
3. Only if Playwright passes AND `GET /health` returns `200` may the slot swap proceed.

- Forbidden:
  - Manual “looks good” validation without automated Playwright + health check.
  - Disabling or skipping Playwright in CI to merge faster.

---

## 5. Antigravity IDE Agent Behavior

When acting as a **Coder Agent** inside antigravity-compatible IDEs:

- **Before writing code**:
  - Read TRD section for the feature.
  - Identify the smallest test layer that can cover the behavior.
  - Create or update the relevant test file:
    - Backend: `VeriFinca.Tests.Unit/*` or `VeriFinca.Tests.Integration/*`.
    - Frontend: `apps/spa/src/**/*.{test,spec}.ts(x)` (Vitest).
    - E2E: `apps/e2e/playwright/*.spec.ts`.

- **During implementation**:
  - Never delete existing tests to “fix red”.
  - If behavior changes legitimately, update the spec in TRD and adjust tests accordingly.

- **Before commit**:
  - Run:
    ```bash
    dotnet test                   # all backend tests
    pnpm test                     # SPA unit tests
    pnpm test:e2e -- --reporter   # Playwright in CI or staging
    ```
  - Abort commit if any test is failing.

---

## 6. What Agents MUST NOT Do

- No feature or bug fix without at least one new or modified test.
- No direct HTTP calls in Playwright tests to bypass the SPA; interact through the UI.
- No snapshots as the only assertion for critical paths; assert specific behavior and state.
- No silent disabling of tests (`[Fact(Skip="")]`, `.skip`, `.only`) in unit/integration/E2E suites.