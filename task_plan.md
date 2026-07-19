# Task Plan: Profile Extension (Dirección, Provincia, Nickname, Seller Badge)

## Objective
Extend User Profile with 3 new fields + seller badge display:
- **Dirección**: text, required, max 200 chars
- **Provincia**: select (32 DR provinces), required
- **NickName**: text, 3–30 chars, unique
- **Seller Badge**: read-only display based on RNC presence

## Phases

### STEP 1 — DB Migration (HUMAN GATE)
- Add direccion, provincia, nickname to Usuario entity
- ⚠️ Requires human approval before execution

### STEP 2 — Backend DTO + Validation + Command
- Update `UpdateProfileCommand` record
- Update `UpdateProfileCommandHandler`
- Update `UpdateProfileRequestDto` in AuthController
- Update `GET /auth/me` to return new fields
- Add nickname uniqueness validation

### STEP 3 — Write Playwright Tests (RED)
- File: `e2e/admin/settings.spec.ts`
- 8 test cases for direccion, provincia, nickname, seller badge

### STEP 4 — Frontend Implementation
- Update `User` interface in AuthService
- Update `UpdateProfileSchema` in schemas.ts with new fields
- Add `PROVINCIAS_RD` constant
- Create `SellerBadge` component
- Update `MyProfileForm` with new inputs
- Wire `useUpdateMyProfile` to pass new fields

### STEP 5 — GREEN Gate
- Run `pnpm exec playwright test e2e/admin/settings.spec.ts`
- All 8 tests must pass

### STEP 6 — Refactor (optional)
- Extract provinces constant to `@/constants/rd-provinces.ts`
- Extract SellerBadge to `@/components/SellerBadge.vue`

## Verification Matrix
| Step | Command | Pass Condition |
|------|---------|---------------|
| 2 | dotnet test | 0 failures |
| 3 | pnpm exec playwright test (RED) | All 8 fail |
| 4 | pnpm exec playwright test | ≥1 new passing |
| 5 | pnpm exec playwright test | All 8 pass, exit 0 |
| 6 | pnpm exec playwright test | Still 0 failures |

## Files to Modify
- `src/backend/Domain/Entities/Usuario.cs`
- `src/backend/Application/Features/Auth/Commands/UpdateProfile/UpdateProfileCommand.cs`
- `src/backend/Application/Features/Auth/Commands/UpdateProfile/UpdateProfileCommandHandler.cs`
- `src/backend/Api/Controllers/AuthController.cs`
- `src/frontend/web/src/features/auth/schemas.ts`
- `src/frontend/web/src/features/auth/services/AuthService.ts`
- `src/frontend/web/src/features/settings/api/useSettings.ts`
- `src/frontend/web/src/features/settings/components/MyProfileForm.tsx`
- `e2e/admin/settings.spec.ts` (new)
