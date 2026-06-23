# Security Audit Workflow

**Purpose:** Perform a comprehensive security review of the codebase or a specific feature.

## When to Use

- Before a major release
- After implementing new auth/consent/seal features
- On a regular schedule (weekly or per sprint)
- When a security finding is reported

## Prerequisites

- Context files loaded: `standards/security-standards.md`, `standards/code-quality-standards.md`
- `.agents/docs/AGENTS.md` constitution loaded

## Workflow Steps

### Step 1: Static Analysis (Reviewer)

1. Run `dotnet list package --vulnerable` (outdated package check)
2. Scan for hardcoded secrets in diffs (GitHub Advanced Security patterns)
3. Review all `appsettings.json` files for accidental secrets
4. Verify Key Vault references are used instead of hardcoded values

### Step 2: Code Review (Reviewer)

Go through the OWASP checklist:

- [ ] **A01 - Broken Access Control:** RBAC attributes on all endpoints? IDOR tests?
- [ ] **A03 - Injection:** FluentValidation on all DTOs? EF Core only (no raw SQL)?
- [ ] **A05 - Security Misconfiguration:** Security headers middleware active? Stack traces disabled in prod?
- [ ] **A07 - Auth:** JWT rotation? 2FA for ADMIN/VALIDATOR? Refresh token rotation?
- [ ] **A08 - Integrity:** SHA-256 hashing on uploaded documents?
- [ ] **A10 - SSRF:** Whitelist-only HTTP clients? No dynamic URL construction?

### Step 3: Compliance Check (Reviewer or Compliance Agent)

- [ ] Consent guard on TransUnion credit check
- [ ] Immutable ConsentRecord (no UPDATE)
- [ ] Data retention purge job configured
- [ ] Audit events emitted for all security-relevant operations
- [ ] Always Encrypted for TransUnion ResponseJson

### Step 4: Report Generation

Generate a structured findings report:

```markdown
## Security Audit Report
**Date:** YYYY-MM-DD
**Scope:** [Feature/Module/Full codebase]

### Critical (Must Fix Before Merge)
- [Finding 1] — CWE-XYZ — Location
- [Finding 2] — CWE-XYZ — Location

### Major (Fix Within Sprint)
- [Finding 3] — CWE-XYZ — Location

### Minor (Fix When Convenient)
- [Finding 4]

### Passed Checks
- [Check A] ✓
- [Check B] ✓
```
