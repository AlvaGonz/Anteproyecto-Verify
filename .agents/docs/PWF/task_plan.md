# Task Plan: CI PNPM Setup Fix

## Goal
Fix the GitHub Actions CI workflow failure where `pnpm/action-setup@v4` fails because of a missing explicit version specification. We will configure it to use version 9 of `pnpm`.

---

## Phases

### Phase 1: Modify Workflow File
- [x] Edit `.github/workflows/ci.yml` to specify `version: 9` in Setup pnpm step.
- [x] **Gate**: Verify YAML formatting and check that no other lines are affected.
- **Status:** completed

### Phase 2: Push and Monitor CI
- [x] Commit and push the pnpm setup changes.
- [ ] **Gate**: Check the new CI run on GitHub via `gh run list` and verify it succeeds.
- **Status:** in_progress

### Phase 3: Fix NuGet Package Downgrade Conflict in IntegrationTests
- [x] Change `Microsoft.EntityFrameworkCore.InMemory` version from `8.0.0` to `8.0.2` in `tests/backend/IntegrationTests/IntegrationTests.csproj`.
- [x] **Gate**: Run `dotnet restore` locally and verify that it succeeds with no downgrade warnings or errors.
- **Status:** completed

### Phase 4: Fix Api.Tests Missing NuGet Package Dependencies
- [x] Add `Microsoft.AspNetCore.Mvc.Testing` and `NSubstitute` package references to `src/backend/Api.Tests/Api.Tests.csproj`.
- [x] **Gate**: Run `dotnet build src/backend/Api.Tests/Api.Tests.csproj` locally and verify it builds successfully with 0 errors.
- **Status:** completed

### Phase 5: Regenerate Outdated pnpm-lock.yaml
- [ ] Run `pnpm install` at root to synchronize and regenerate `pnpm-lock.yaml` with root `package.json`.
- [ ] **Gate**: Verify that `pnpm-lock.yaml` is updated and not rejected.
- **Status:** in_progress

### Phase 6: Push and Verify CI Green
- [ ] Commit all changes and push to `feat-frontend` branch.
- [ ] **Gate**: Monitor GitHub Actions and verify the CI run is fully green.
- **Status:** pending

---

## Constraints
- ONLY specify explicit version 9 of pnpm.
- DO NOT use npm or yarn. The project is strictly pnpm only.
