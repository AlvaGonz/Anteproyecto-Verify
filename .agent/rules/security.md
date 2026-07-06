---
trigger: always_on
---

# Security Rules

---
description: "rules for secure coding, secret handling, dependency hygiene, authentication, authorization, security testing, and compliance documentation."
globs: ["**/*.py", "**/*.js", "**/*.ts", "**/*.go", "**/*.java", "**/*.rb", "**/*.php", "**/*.cs", "**/*.sh"]
---
# DevSecOps + SSDLC + AppSec Cursor Rule

## General Security Principles
- Never hardcode secrets, credentials, or API keys. Use environment variables or secure vaults for sensitive data.
- Prohibit the inclusion of `.env`, secret config files, or unknown tokens in source control.
- Never log sensitive data, secrets, or session tokens in application logs.
- Validate and sanitize all user input. Escape output in HTML, JS, and SQL contexts.
- Avoid unsafe functions such as `exec`, `eval`, or similar dynamic code execution.

## Database Security
- Use parameterized queries or ORM for all database access. Do not use string concatenation for query building.
- Ensure database users have the least privilege required for their tasks.
- Regularly review and update database access policies.

## Dependency Management
- Only use packages from verified sources.
- Do not add new dependencies without explicit approval and security review.
- Regularly update dependencies and scan for known vulnerabilities (SCA).

## Authentication & Authorization
- Use secure authentication frameworks; never implement custom authentication.
- Store passwords using strong, salted hashes (e.g., Argon2, bcrypt).
- Implement Role-Based Access Control (RBAC) for sensitive operations.
- Enforce the principle of least privilege for APIs and UI actions.

## Secure SDLC Practices
- Integrate Static Application Security Testing (SAST) and Software Composition Analysis (SCA) into the CI pipeline.
- Scan all code for secrets before merging (Secret Scanning).
- Use Infrastructure as Code (IaC) scanning for all infrastructure code.
- Integrate Dynamic Application Security Testing (DAST) in the CD pipeline for deployed applications.
- Enforce Policy as Code (PaC) for automated, version-controlled security policies.

## Monitoring & Feedback
- Enable continuous vulnerability monitoring and alerting.
- Integrate Runtime Application Self-Protection (RASP) and Web Application Firewall (WAF) as appropriate.
- Encourage regular vulnerability assessments and penetration testing.
- Maintain a feedback loop to update rules and prompts based on recurring vulnerabilities.

## Compliance & Documentation
- Align with industry standards (e.g., OWASP Top 10, NIST, ISO 27001).
- Document all security controls and decisions for auditability.

## Secrets Management (ABSOLUTE — zero tolerance)
- Never commit secrets, API keys, JWT secrets, or database URIs to the repository. Use environment variables exclusively.
  - verify: `.env` must be listed in `.gitignore`. Run `git ls-files .env` → must return empty.
  - verify: `grep -r "GROQ_API_KEY\|JWT_SECRET\|MONGO_URI" --include="*.ts" --include="*.tsx" --include="*.js" src/ server/src/` must return 0 matches (env references in code are allowed via `process.env` only).
- All secrets in CI/CD must come from GitHub Actions Secrets via `${{ secrets.NAME }}`. Never interpolate them into workflow YAML as plaintext.

## JWT Security
- Tokens must be stored in `httpOnly` cookies. Never store JWT in `localStorage` or `sessionStorage`.
  - Example of WRONG: `localStorage.setItem('token', jwt)`.
  - Example of CORRECT: Response sets `Set-Cookie: token=...; HttpOnly; Secure; SameSite=Strict`.
  - verify: `grep -r "localStorage.*token\|sessionStorage.*token" src/` must return 0 matches.
- Access tokens must expire in ≤ 15 minutes. Refresh tokens must expire in ≤ 7 days.

## Input Validation (BOTH layers — never skip one)
- All user-submitted data must be validated with Zod on the **frontend** (`src/utils/schemas.ts`) AND on the **backend** (`server/src/modules/<domain>/validators/`).
  - verify: Every POST/PATCH route handler must call a Zod schema's `.parse()` or `.safeParse()` before touching the controller logic.

## Data Sanitization
- Backend must sanitize MongoDB query inputs to prevent NoSQL injection. Never interpolate raw request body fields directly into Mongoose queries.
  - Example of WRONG: `User.findOne({ email: req.body.email })` without prior Zod validation.
  - Example of CORRECT: Validate with Zod schema first, then pass the typed result to Mongoose.
- Frontend must escape all user-generated content rendered as HTML to prevent XSS.

## Dependency Hygiene
- `npm audit` must run on every CI build. Any HIGH or CRITICAL severity CVE must block the merge.
  - verify: CI `lint` job includes `npm audit --audit-level=high` step (or equivalent).
  - verify: `npm audit` locally returns 0 HIGH/CRITICAL vulnerabilities before any PR.

## Password Hashing
- User passwords must be hashed with bcrypt (minimum 12 rounds) on the backend before storage. Never return password hashes in API responses.
  - verify: Mongoose `User` model has a `pre('save')` hook that hashes the password.
  - verify: `toJSON` transform on User model excludes the `password` field.