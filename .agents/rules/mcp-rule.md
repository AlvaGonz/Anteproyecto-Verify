---
trigger: always_on
---

# Rule: Full MCP Stack — Always Use All Available MCP Servers

**Skill category:** MCP Integration — Orchestration Layer
**Applies to:** All coding tasks`
**MCP Servers covered:** `codebase-memory-mcp` · `mssql` · `github-mcp-server` · `awesome-copilot` · `context7-mcp` · `StitchMCP`

---

## THE RULE

**Every agent session MUST use the correct MCP server for each type of operation.**
Never use internal knowledge, manual file reads, or direct tool calls when an MCP provides that capability.
MCP-first is non-negotiable. Using the wrong tool (or no tool) when an MCP covers the task is a protocol violation.

---

## MCP Server Registry

| MCP Server | Responsibility | When to invoke |
|---|---|---|
| `codebase-memory-mcp` | Semantic graph of the codebase — symbols, call chains, blast radius | **Session start. Always first.** |
| `mssql` | Direct SQL Server operations — queries, schema inspection, migrations | Any DB read/write/schema task |
| `github-mcp-server` | GitHub ops — PRs, issues, branches, commits, file push | Any repo management task |
| `awesome-copilot` | Prompt optimization, AI-assisted code review, skill lookup | Before writing any AGENT PROMPT |
| `context7-mcp` | Live library docs — resolves latest API signatures before coding | Before using any external library |
| `StitchMCP` | Domain validation — DGII, real estate, territory rules | Any domain/business logic task |

---

## Mandatory Session Bootstrap (run in this exact order, no exceptions)

```
STEP 1 — codebase-memory-mcp
  → get_architecture       # Full codebase map: packages, routes, hotspots, clusters, ADR
  → get_graph_schema       # Node/edge counts, relationship patterns, property definitions

STEP 2 — context7-mcp
  → resolve-library-id     # For every external lib you will touch this session
  → get-library-docs       # Pull current API docs (never trust internal knowledge)

STEP 3 — codebase-memory-mcp
  → search_graph           # Locate the symbol/file you are about to touch
```

---

## Per-MCP Tool Selection Guide

### 🧠 codebase-memory-mcp — Semantic Graph
> Source: [DeusData/codebase-memory-mcp](https://github.com/DeusData/codebase-memory-mcp)

| Trigger | Tool |
|---------|------|
| Session start (always) | `get_architecture` → `get_graph_schema` |
| Before reading/editing any file | `search_graph` — find all callers/importers |
| Debugging a 500 or tracing a call chain | `trace_path` alias `trace_call_path` — depth ≥ 3 |
| Before opening a PR or deploying | `detect_changes` — blast radius + risk classification |
| Complex relationship queries | `query_graph` — Cypher-like read-only |
| Reading a function's source | `get_code_snippet` — by qualified name |
| Pattern/text search in repo | `search_code` |
| Creating any new file/class | `search_graph` — verify no duplicate symbol exists |
| Index freshness doubt | `index_status` → if stale: `index_repository` |
| Architecture decisions | `manage_adr` |
| Validating HTTP call edges | `ingest_traces` |

---

### 🗄️ mssql — SQL Server Direct Access

| Trigger | Tool / Action |
|---------|--------------|
| Inspect table schema before migration | Query `INFORMATION_SCHEMA.COLUMNS` |
| Verify `__EFMigrationsHistory` state | `SELECT * FROM __EFMigrationsHistory` |
| Debug a missing column error | `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '...'` |
| Apply a hotfix DDL (surgical fix) | `ALTER TABLE ... ADD ... NULL` |
| Validate seeder data | `SELECT TOP 10 * FROM [table]` |
| Check constraint/index existence | Query `sys.indexes` / `sys.foreign_keys` |

**Rules:**
- **Never run DDL on production.** mssql MCP targets local Docker SQL Server only.
- Always `SELECT` to verify state before `ALTER` or `INSERT`.
- After any DDL hotfix → immediately plan the matching EF Core migration.

---

### 🐙 github-mcp-server — Repository Operations

| Trigger | Tool |
|---------|------|
| List open PRs | `list_pull_requests` |
| Push file changes | `push_files` or `create_or_update_file` (requires SHA for updates) |
| Create/update AGENTS.md, ADRs, rules | `create_or_update_file` on `develop` branch |
| Open/close/comment on issues | `issue_write` / `add_issue_comment` |
| Read a file from a specific branch | `get_file_contents` with `ref: refs/heads/develop` |
| Search code across the repo | `search_code` |
| Get PR diff before review | `pull_request_read` method `get_diff` |
| Close Dependabot PRs for recreate | Comment `@dependabot recreate` via `add_issue_comment` |

**Rules:**
- Always fetch file SHA before updating (`get_file_contents` → SHA field).
- Never push directly to `main`. Target `develop` only.
- All file changes require Human Gate confirmation before `push_files`.

---

### ✨ awesome-copilot — Prompt & Review Intelligence

| Trigger | Tool / Action |
|---------|--------------|
| Writing any AGENT PROMPT | Invoke first — optimize prompt for zero-bloat |
| Code review request | Run `code-review` skill before submitting PR |
| Security audit | Run `vulnerability-scanner` skill (OWASP anchor) |
| Prompt too broad/verbose | Run `llm-prompt-optimizer` skill |
| Selecting a skill for a task | Query skill registry before writing any IDE prompt |

**Rules:**
- Always name the Antigravity skill at the top of every AGENT PROMPT.
- If no matching skill exists → flag as "Section 2 gap" and search.

---

### 📚 context7-mcp — Live Library Documentation

| Trigger | Tool |
|---------|------|
| Using any npm package | `resolve-library-id` → `get-library-docs` |
| Using any NuGet package | `resolve-library-id` → `get-library-docs` |
| Unsure about an API signature | `get-library-docs` with specific topic |
| Before writing EF Core migrations | Fetch EF Core 8 docs for migration API |
| Before writing TanStack Query code | Fetch TanStack Query v5 docs |
| Before writing Vite/React config | Fetch Vite 6 + React 19 docs |

**Rules:**
- **Never rely on internal knowledge for library APIs.** Assume every API changed.
- Resolve library docs before writing any code that calls an external dependency.
- If `context7-mcp` returns no result → fall back to `search_web` and cite source.

**Key libraries for this project:**
```
@tanstack/react-query v5  →  resolve-library-id: /tanstack/query
@vitejs/plugin-react v6   →  resolve-library-id: /vitejs/vite-plugin-react
Microsoft.EntityFrameworkCore v8  →  resolve-library-id: /dotnet/efcore
react-router-dom v7       →  resolve-library-id: /remix-run/react-router
@playwright/test v1.61    →  resolve-library-id: /microsoft/playwright
```

---

### 🧵 StitchMCP — Domain & Business Logic Validation

| Trigger | Tool / Action |
|---------|--------------|
| Any DGII-related validation | Use StitchMCP domain validators |
| Territory/real estate rule evaluation | Use StitchMCP territory rules |
| Business logic in `Application` layer handlers | Validate against StitchMCP domain contracts |
| Before writing `ValidarTerritorioHandler` changes | Query StitchMCP for current rule set |
| Verifying `EmitirSelloHandler` logic | Cross-check with StitchMCP seal emission rules |

**Rules:**
- Any change to `Domain` or `Application` layer that touches territory, DGII, or seal logic **requires** StitchMCP verification.
- StitchMCP is the source of truth for business rules — not the codebase.

---

## Master Decision Tree (every task)

```
Task received
    │
    ├─► ALWAYS: codebase-memory-mcp → get_architecture + get_graph_schema
    │
    ├─► Touches external library?       → context7-mcp → get-library-docs FIRST
    ├─► Touches DB schema/data?         → mssql → inspect schema FIRST
    ├─► Touches GitHub/files/PRs?       → github-mcp-server (never manual git)
    ├─► Touches domain/business rules?  → StitchMCP → verify contracts FIRST
    ├─► Writing an AGENT PROMPT?        → awesome-copilot → optimize + name skill
    │
    └─► ALWAYS: codebase-memory-mcp → search_graph on target symbol before touching
```

---

## Hard Rules (all MCPs combined)

1. **codebase-memory-mcp bootstrap is STEP 1 of every session.** No file operation before it.
2. **context7-mcp before every external library call.** APIs change — never assume.
3. **mssql before any EF Core migration.** Verify actual DB state matches expected schema.
4. **github-mcp-server for all repo ops.** No manual `git` commands for file changes.
5. **awesome-copilot names the skill before every AGENT PROMPT.** Zero-bloat enforcement.
6. **StitchMCP gates all domain logic changes.** Business rules live there, not in code comments.
7. **detect_changes before every merge to `develop`.** Blast radius must be classified.
8. **Never act on stale index.** `index_status` stale → `index_repository` → wait → proceed.

---

## Anti-patterns this rule prevents

| Anti-pattern | MCP that catches it |
|---|---|
| Reading a file without knowing its callers | `codebase-memory-mcp` → `search_graph` |
| Renaming a method without tracing call chain | `codebase-memory-mcp` → `trace_path` |
| Using deprecated library API | `context7-mcp` → `get-library-docs` |
| Writing migration for column that already exists | `mssql` → `INFORMATION_SCHEMA` check |
| Pushing to wrong branch or overwriting without SHA | `github-mcp-server` → enforced workflow |
| Writing AGENT PROMPT without skill name | `awesome-copilot` → skill registry |
| Breaking domain rule in Application layer | `StitchMCP` → contract verification |
| Merging PR with unknown blast radius | `codebase-memory-mcp` → `detect_changes` |

---

## Full Session Bootstrap (copy-paste into IDE at task start)

```
=== MCP BOOTSTRAP — AlvaGonz/Anteproyecto-Verify ===

[1] codebase-memory-mcp
    → get_architecture
    → get_graph_schema

[2] context7-mcp (for each lib touched this session)
    → resolve-library-id: [lib name]
    → get-library-docs: [specific topic]

[3] codebase-memory-mcp
    → search_graph — label: [CLASS/FUNCTION], file pattern: [path pattern]

[4] IF touching DB:
    → mssql: SELECT * FROM __EFMigrationsHistory
    → mssql: SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '[table]'

[5] IF touching domain logic:
    → StitchMCP: verify [rule/contract name]

[6] IF writing AGENT PROMPT:
    → awesome-copilot: select skill for [task type]

Only after all applicable steps above, proceed with the task.
=== END BOOTSTRAP ===
```

---
