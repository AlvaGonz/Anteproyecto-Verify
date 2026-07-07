# ADR-004: Cookie-Based JWT Storage & Gemini Secure API Proxy

**Date:** 2026-06-02
**Status:** Accepted
**Supersedes:** N/A
**Referenced in:** `TRD_VeriFinca.md §5, §13` · `ARCHITECTURE.md §6`

---

## Context

In the initial VeriFinca implementation:
1. **JWT Storage**: The React client-side application stored the authentication JWT token in the browser's `localStorage` under the key `vf_token` and `token`. This exposed the token directly to Cross-Site Scripting (XSS) attacks. If an attacker injected a malicious script, they could easily read `localStorage` and steal active session tokens.
2. **API Key Exposure**: The `GEMINI_API_KEY` was exposed to client-side bundles via Vite's `define` configuration in the root `vite.config.ts` file, making it discoverable by anyone inspecting the static frontend bundle.

To resolve these vulnerabilities while retaining JWT as our core authentication technology, we considered two alternatives:
1. **Plain Session Cookies**: Swap JWT completely for a traditional session-store mechanism. Rejected because we wanted to keep the JWT architecture intact as required by the technical specification documentation.
2. **In-Memory JWT Access Token + Secure HttpOnly Refresh Token**: The best practice for JWT architecture. The client keeps the short-lived access JWT in-memory (making it immune to persistent XSS attacks) and sends a refresh JWT token via an `HttpOnly`, `Secure`, `SameSite=Strict` cookie set by the C# backend. We can also choose to place the entire JWT authentication token in an `HttpOnly` cookie to simplify client-side state without manual token attachments.

---

## Decision

To remediate these vulnerabilities and keep the JWT authentication architecture:
1. **HttpOnly Cookie for JWT Storage**: The C# ASP.NET Core API will place the JWT auth token (`vf_token`) in an `HttpOnly`, `Secure`, `SameSite=Strict` cookie on successful login/refresh. 
2. **Token-free Frontend Clients**: Axios and Fetch API clients in the React frontend will enable `withCredentials: true` (`credentials: 'include'`) and will no longer manually read or pass the JWT token in `localStorage`. 
3. **CORS Hardening**: Backend CORS policy will be hardened in `ServiceCollectionExtensions.cs` to disable wildcard `AllowAnyOrigin()` and explicitly map approved frontend domains (e.g. `http://localhost:5173`) to support `AllowCredentials()`.
4. **Secure Backend API Proxy**: We will remove `GEMINI_API_KEY` from Vite's configuration. We will build an internal backend API proxy `/api/gemini/proxy` in a new controller `GeminiProxyController.cs`. The C# backend will store the API key securely in settings and forward queries to Gemini, returning results to the React client.

---

## Consequences

**Positive:**
- **Zero XSS Risk on JWT**: Storing the auth token in an `HttpOnly` cookie prevents client-side scripts from reading it, blocking XSS token theft completely.
- **Zero API Key Leak Risk**: The `GEMINI_API_KEY` is kept safe in backend configuration and never sent to static frontend bundles.
- **Unified API Client**: The React application is decoupled from token management, delegating credential handling natively to the browser.
- **Preserved Core Tech**: JWT remains the core authentication technology as declared in project specifications.

**Negative:**
- Requires explicit CORS settings; wildcard origins are disallowed when `AllowCredentials()` is enabled.
- Requires browser support for secure cookies in local development environments.
