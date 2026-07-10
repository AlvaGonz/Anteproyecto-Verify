# Resend Email Integration E2E Tests

## PLAN
1. **Extend Test Controller**: Add endpoints to `EmailTestController.cs` for:
   - `UC-05` (Subscription Activated)
   - `UC-06` (Project Status Change)
2. **Create E2E API Tests**: Implement a Playwright test file `e2e/api/12-resend-email-all-usecases.spec.ts` that triggers all 7 endpoints to confirm API and Email dispatch logic.
3. **Execute & Verify**: Run `npx playwright test` to ensure all endpoints return 200 OK and correctly dispatch emails through the Resend API.

- [x] Extend Test Controller
- [x] Create E2E API Tests
- [x] Execute & Verify
