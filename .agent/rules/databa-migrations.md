---
trigger: always_on
---

---
rule: database-migrations
version: 1.0.0
type: always
skills: [sql-optimization-patterns, dotnet-best-practices]
anchors:
  - .agents/docs/ARCHITECTURE.md#7-entity-relationship-diagram
  - .agents/docs/TRD-VeriFinca.md#8-database-schema
  - .agents/docs/AGENTS.md#2-mcp-mandate
---

# DATABASE MIGRATIONS PROTOCOL
# VeriFinca — Type 1 Decision Gate
# AGENTS.md §ZERO-TRUST + §MCP MANDATE enforcement

## 0. CLASSIFICATION

Every EF Core migration is a **Type 1 Decision** under the Agentic Constitution.
It is **irreversible in production without explicit rollback**.
No agent may generate, apply, or commit a migration without completing
all gates in this rule in sequence.

---

## 1. PRE-MIGRATION GATE — MCP FIRST, CODE NEVER

Before writing any migration file, the agent MUST:
STEP 1 — Connect via PostgreSQL/Azure SQL MCP server.
Read AppDbContext live schema. Do NOT infer columns from memory.
Command: [MCP] GET schema tables=ALL

STEP 2 — Read ARCHITECTURE.md §7 ERD.
Confirm the proposed change matches the Mermaid ER diagram exactly.
If they diverge → UPDATE the ERD first. No migration before ERD sync.

STEP 3 — Read TRD-VeriFinca.md §8 for the affected table(s).
Confirm column names, types, constraints, and FK relationships.

STEP 4 — Read .agents/docs/PWF/progress.md
Confirm no in-progress feature owns the same table.
If conflict found → STOP and report to human.

text

**If MCP server is unavailable:** STOP. Do not guess schema.
Write to `progress.md`:
BLOCKED: Database MCP unavailable. Migration for [TableName] cannot proceed.
Human action required: confirm schema via MCP before proceeding.

text

---

## 2. FORBIDDEN OPERATIONS — HUMAN GATE REQUIRED

The following operations require **explicit written human approval**
in the PR description before the agent may generate migration code.

| Operation | Reason | Gate |
|---|---|---|
| `DROP COLUMN` | Data loss — irreversible in prod | Human must confirm column is unused in all queries, seeder, and Zod schemas |
| `DROP TABLE` | Full data destruction | Human must confirm via ADR + Law 172-13 retention check |
| `RENAME COLUMN` | Breaks EF Core mappings + Zod sync | Human must provide old→new mapping for all affected layers |
| `ALTER COLUMN` (type change) | Potential silent truncation | Human must confirm no data exceeds new constraint |
| Any change to `ConsentRecords` | Law 172-13 — legal evidence | Human gate + legal review note required in ADR |
| Any change to `AuditLogs` | Law 172-13 — audit trail | Same as above |
| Any change to `IntegritySeals` | RSA-2048 signature integrity | ADMIN + human gate mandatory |

**If you encounter any of the above without a human approval comment in the current
task/PR:** STOP. Do not proceed. Add to `progress.md` under "Open Decisions".

---

## 3. ZOD SCHEMA SYNC — MANDATORY, SAME COMMIT

Every migration that adds, removes, or renames a column MUST include
a matching Zod schema update in the same atomic commit.

### Sync Rules
Backend column added → Add field to corresponding Zod schema in src/lib/schemas/
Backend column removed → Remove field from Zod schema + update all forms using it
Type changed → Update Zod .type() or .coerce() to match new SQL type
Nullable changed → Update Zod .optional() / .nullable() accordingly
New FK relationship → Add .uuid() reference field to parent Zod schema

text

### File mapping (required knowledge before migration):

| EF Core Table | Zod Schema File |
|---|---|
| `Projects` | `src/lib/schemas/project.schema.ts` |
| `Documents` | `src/lib/schemas/document.schema.ts` |
| `ValidationResults` | `src/lib/schemas/validation.schema.ts` |
| `ConsentRecords` | `src/lib/schemas/consent.schema.ts` |
| `IntegritySeals` | `src/lib/schemas/seal.schema.ts` |
| `AuditLogs` | `src/lib/schemas/audit.schema.ts` |
| `Users` | `src/lib/schemas/user.schema.ts` |

**Verification command before commit:**
```bash
# Confirm Zod schema compiles and type-checks with no errors
cd spa && npx tsc --noEmit
```

A migration commit that does NOT include its Zod counterpart is
**an incomplete commit and must not be pushed**.

---

## 4. MIGRATION AUTHORING RULES
✅ ALWAYS use EF Core parameterized migrations — never raw SQL strings.
✅ ALWAYS name migrations descriptively:
dotnet ef migrations add Add_RNC_Index_To_Projects
NOT: dotnet ef migrations add Migration1

✅ ALWAYS add an index for every new FK column.
✅ ALWAYS set explicit DEFAULT values — never rely on DB engine defaults for
columns used in application logic.
✅ ALWAYS include a Down() method that fully reverses the Up() migration.

❌ NEVER use dotnet ef database update in CI — migrations run via
DbContext.Database.MigrateAsync() at application startup.
❌ NEVER hardcode GUIDs, user IDs, or seed data in migration files.
Seed data lives in Infrastructure/Persistence/Seeder.cs only.
❌ NEVER add raw SQL to migration files unless:
(a) EF Core Fluent API cannot express the constraint, AND
(b) human has approved via PR comment.
❌ NEVER bypass the Always Encrypted configuration for
ValidationResults.ResponseJson WHERE Source = 'TRANSUNION'.

text

---

## 5. INDEX & QUERY PERFORMANCE GATE

Before committing any migration that adds a new table or column
that will be queried in a WHERE or JOIN clause:
REQUIRED: Add a composite or single-column index for every:
- FK column (e.g., ProjectId on all child tables)
- Column used in WHERE filters (e.g., ValidationStatus, Source, IsRevoked)
- Column used in ORDER BY on paginated endpoints

FORBIDDEN patterns in EF Core queries on migrated columns:
❌ .Where(x => x.SomeColumn.Contains(input)) → full table scan
❌ .ToList().Where(...) → client-side evaluation
✅ .Where(x => EF.Functions.Like(x.Col, $"%{input}%"))
✅ .Where(x => x.Status == ValidationStatus.PASS)

text

---

## 6. LAW 172-13 RETENTION COMPLIANCE CHECK

Before any migration touching `ConsentRecords`, `AuditLogs`,
or `ValidationResults` (TransUnion rows):
Confirm the change does NOT shorten the retention period defined in TRD §6.5.

ConsentRecords: 7 years minimum

AuditLogs: 7 years minimum

TransUnion ResponseJson: 30 days post-seal (purge job, NOT migration)

Confirm no CASCADE DELETE is introduced on these tables.
EF Core: .OnDelete(DeleteBehavior.Restrict) is the ONLY allowed behavior
for ConsentRecords and AuditLogs FK relationships.

If a purge behavior is needed → it MUST be implemented in
Infrastructure/BackgroundJobs/DataRetentionPurgeJob.cs
NOT as a migration or DB trigger.

text

---

## 7. COMMIT CHECKPOINT PROTOCOL
STEP 1 → dotnet build — zero errors
STEP 2 → dotnet ef migrations add [Name] --project VeriFinca.Infrastructure
STEP 3 → dotnet test — zero failures, ≥80% coverage Domain/Application
STEP 4 → npx tsc --noEmit (in /spa) — zero TypeScript errors
STEP 5 → git add [MigrationFile] [ZodSchemaFile] [ERD update in ARCHITECTURE.md]
STEP 6 → git commit -m "db: [descriptive migration name] + zod sync"

If any step fails → revert migration file, do NOT commit partial state.
Rollback: dotnet ef migrations remove

text

---

## 8. ARCHITECTURE.md UPDATE — MANDATORY

Any migration that adds/removes a table or column that changes
a relationship in the ERD **must update** `ARCHITECTURE.md §7`
in the **same commit** as the migration.

No exceptions. A migration commit without an ERD update is
**an architectural drift violation** and the PR must be blocked.

---

## VIOLATION ESCALATION

If an agent cannot complete any gate above:

1. Do NOT guess, skip, or approximate.
2. Write the blocker to `.agents/docs/PWF/progress.md` under "Open Decisions".
3. Stop the session and surface to human.

> "A migration written without MCP schema confirmation is a Zombie Revert
>  waiting to happen." — AGENTS.md §MCP Mandate