# /run-security-audit

**Purpose:** Run a comprehensive security and compliance audit on the codebase.

## Usage

```
/run-security-audit [--scope=<full|feature>] [--feature=<name>]
```

## Options

| Option | Description |
|--------|-------------|
| `--scope=full` | Full codebase audit (default) |
| `--scope=feature` | Audit a specific feature |
| `--feature=<name>` | Feature name (required with `--scope=feature`) |

## Examples

```
/run-security-audit
/run-security-audit --scope=feature --feature="consent-management"
```

## Checks

1. **OWASP Top 10** — Full checklist per `standards/security-standards.md`
2. **IDOR Scan** — Check all `{id}` parameters for proper authorization
3. **Consent Guard** — Verify TransUnion credit check is gated
4. **Data Retention** — Verify purge jobs configured with correct TTLs
5. **Secret Scan** — Check for hardcoded secrets in recent diffs
6. **RBAC Audit** — Verify all endpoints have correct role attributes
7. **Architecture Compliance** — Verify Clean Architecture rules
8. **Logging Audit** — Verify structured logging on all security events

## Output

Generates a structured findings report:

```
Security Audit Report — 2026-06-23
Scope: Full codebase

CRITICAL (0):
  ✅ None found

MAJOR (1):
  ⚠️  ConsentRecord repository allows UPDATE — should be INSERT-only

MINOR (3):
  ⚠️  2 endpoints missing FluentValidation
  ⚠️  ILogger missing on 1 handler
  ⚠️  Security headers comment references old CSP value

PASSED (8/8 OWASP checks)
```

## Related

- Loads `context/standards/security-standards.md`
- Loads `context/domain/legal-framework.md`
- Routes to `@reviewer-agent` and `@compliance-agent`
- References `workflows/security-audit-workflow.md`
