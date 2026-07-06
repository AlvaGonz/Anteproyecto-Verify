# ADR-006: JWT Storage Migration — localStorage to httpOnly Cookies

> **Status:** Proposed | **Date:** 2026-06-29 | **SEC-001 Gate**
> **Context:** ORCH-TEST-001 finding — JWT tokens stored in localStorage are XSS-vulnerable

## Context

The current authentication flow stores JWT access tokens in `localStorage` via the frontend AuthService. This is a well-documented security vulnerability: any XSS injection on any page can exfiltrate tokens and impersonate the user.

Law 126-02 Art. 32 and OWASP Top 10 (A07:2025 — Identification and Authentication Failures) require secure token storage.

## Decision

Migrate from `localStorage` JWT storage to **httpOnly secure cookies with SameSite=Strict**.

### Architecture Changes Required

| Component | Current | Target |
|-----------|---------|--------|
| Token storage | localStorage (client-side JS) | httpOnly cookie (server-set) |
| Auth middleware | Bearer header from Axios interceptor | Cookie sent automatically by browser |
| Refresh token | Client-side rotation | httpOnly cookie + server rotation |
| CSRF protection | None (no mutation endpoints risked) | Anti-CSRF token for state-changing requests |
| Backend Program.cs | No cookie config | Cookie authentication + JWT Bearer dual support |

### Migration Plan (4 Phases)

#### Phase 1: Backend Cookie Configuration
- Add `CookieAuthenticationDefaults.AuthenticationScheme` middleware
- Configure cookie: `httpOnly: true`, `secure: true`, `sameSite: SameSiteMode.Strict`
- Set JWT in `Response.Cookies` on login/refresh instead of (or in addition to) response body
- Set cookie path: `/api` to scope to API requests only

#### Phase 2: Frontend AuthService Update
- Remove `localStorage.getItem/setItem` for tokens from `AuthService.ts`
- Remove `Bearer` header injection from Axios interceptor
- AuthService sends credentials: `'include'` for API requests
- Handle 401 → redirect to login flow

#### Phase 3: CSRF Protection
- Add anti-CSRF token endpoint: `GET /api/auth/antiforgery/token`
- Frontend fetches CSRF token on app init, sends as `X-CSRF-TOKEN` header
- Backend validates CSRF token on all state-changing requests

#### Phase 4: Test Updates
- Update all AuthService mocks to use cookie-based flow
- Add E2E test for cookie expiration and refresh
- Add Playwright test verifying token is NOT accessible via `document.cookie` (httpOnly)
- Verify QR seal public endpoint (`/verify/:sealId`) does NOT require auth cookie

### Migration Risk Assessment

| Risk | Mitigation |
|------|------------|
| Cookie not sent on cross-origin | SameSite=Strict prevents — ensure API and frontend same origin in prod |
| Cookie size limit (4KB) | JWT within limits; keep claims minimal |
| Old clients with localStorage tokens | Add grace period: accept both methods for 1 release cycle |
| CSRF on GET requests | Only validate CSRF on POST/PUT/PATCH/DELETE |
| Refresh token rotation | Rotate refresh token on every use; revoke old one immediately |

### Consequences

**Positive:**
- JWT token is NOT accessible from JavaScript (XSS-safe)
- Automatic cookie attachment for all API requests
- Aligns with OWASP ASVS 5.0 requirements
- Law 126-02 compliance for digital identity verification

**Negative:**
- CSRF token implementation adds complexity
- Cookie size limits may constrain future JWT claims
- Migration requires coordinated backend + frontend + test changes
- Grace period increases attack surface temporarily

### Rejected Alternatives

| Alternative | Reason |
|-------------|--------|
| Keep localStorage + XSS prevention only | Defense in depth — single layer is insufficient |
| sessionStorage | Same XSS vulnerability; lost on tab close (bad UX) |
| Memory-only (JS variable) | Lost on refresh; token persistence needed |
| Web Worker storage | Complex; doesn't fully prevent access |
| Backend session (no JWT) | Requires stateful server — conflicts with scalability goals |

## Decision

**ACCEPTED** — Migrate to httpOnly cookies. Implementation deferred until after core MVP features.

**SEC-001 Status:** Plan documented. Requires human architect sign-off to proceed.
