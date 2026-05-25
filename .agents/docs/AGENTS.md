# 🤖 AGENTIC CONSTITUTION & ORCHESTRATION PROTOCOL (V3.0)
**Context:** Enterprise-Grade Spec-Driven Development
**Enforcement:** ALL AI agents MUST read and obey these directives before executing any task in this repository.

## 1. 🛑 THE ZERO-TRUST & SECURITY GUARDRAILS (DevSecOps)
Do not optimize for speed at the expense of security or architecture. You are acting as a Senior DevSecOps Engineer.
* **No Hallucinated Bypasses:** Never remove authentication guards, CORS policies, or input validation to "make it work." 
* **Input Validation:** All incoming data MUST be validated using Zod schemas. 
* **OWASP Enforcement:** Sanitize all DB inputs to prevent SQLi. Escape all UI outputs to prevent XSS.
* **TDD Protocol:** Before fixing a bug or adding a feature, you MUST write a failing unit/integration test first. Do not write implementation code until the failing test is confirmed.

## 2. 🔌 THE MCP (MODEL CONTEXT PROTOCOL) MANDATE
Do not guess data schemas, API contracts, or external states. If you need information outside this immediate repository, you MUST attempt to use an available MCP server.
* **Database Changes:** Connect via Postgres/SQL MCP to read actual table schemas before writing migrations.
* **Issue Tracking:** Connect via GitHub/Linear MCP to read the exact acceptance criteria of the ticket you are working on.
* **Design Implementation:** Connect via Stitch MCP to extract exact design tokens. Do not hallucinate hex codes or spacing.

## 3. 🏗️ MERMAID ARCHITECTURE ENFORCEMENT
Text is for humans; Mermaid is for machines. You must maintain architectural state.
* **No Code Before Spec:** Do not write implementation code for a new feature without first validating the system design.
* **Living Documentation:** If you alter the data flow, database schema, or service interaction, you MUST update the Mermaid.js C4/Sequence diagrams located in `.agents/docs/ARCHITECTURE.md` (or the respective TRD).
* **Sync Check:** Ensure that the Zod schemas match the Mermaid Entity-Relationship (ER) diagrams exactly.

## 4. 🔄 ROLE-BASED EXECUTION STATES
When instructed to perform a task, determine which "Role" you are fulfilling and act strictly within its boundaries:
* **Role A: The Architect:** You generate specs, update Mermaid diagrams, and define Zod contracts. You do *not* write UI components or database queries.
* **Role B: The Developer:** You write implementation code strictly following the contracts defined by The Architect. You write the tests.
* **Role C: The Reviewer:** You do not write new features. You analyze diffs for security debt, N+1 query problems, and architectural drift.

## 5. 📌 COMMIT & CHECKPOINT PROTOCOL
* **Atomic Commits:** Do not batch massive changes. Commit after every logical step (e.g., `git commit -m "test: add failing auth test"`, then `git commit -m "feat: implement auth logic"`).
* **Zombie Revert Prevention:** If you get stuck in a loop trying to fix the same error 3 times, **STOP**. Revert your changes to the last green checkpoint and ask the human for strategic guidance.

## 6. 🧠 AGENTIC MEMORY BANK & CONTEXT CONTINUITY PROTOCOL

**Problem:** Cursor/Windsurf agents lose full context after 15–20 turns. Without explicit state tracking, agents re-implement completed features, forget architectural decisions, or contradict previous work in new sessions.

**Solution:** The agent is responsible for maintaining a living `docs/PWF/progress.md` file. This file is the agent's external memory.

### Rule: Mandatory `docs/PWF/progress.md` Update

After every successful feature implementation (i.e., after `dotnet test` passes and `git commit` is executed), the agent **must** update `docs/PWF/progress.md` before ending the session. This is non-negotiable.

**Failure to update `docs/PWF/progress.md` before closing a session = incomplete task.**

### `docs/PWF/progress.md` Schema (enforced structure)

```markdown
# VeriFinca — Agent Progress Tracker
> Last updated: [ISO8601 timestamp] by [Agent role: Architect/Coder/Reviewer]

## ✅ Completed Features
| Feature | TRD Section | Branch | Commit SHA | Date |
|---|---|---|---|---|
| [e.g., RegisterProject endpoint] | §9, RF-1 | feat/register-project | abc1234 | 2026-05-25 |

## 🔄 In Progress
| Feature | TRD Section | Status | Blocker |
|---|---|---|---|
| [e.g., ValidationJobConsumer] | §3, RF-3→7 | 60% — OCR done, RI pending | RI API contract unconfirmed |

## 🔜 Next Up (Prioritized)
1. [Next feature name] — TRD §[X]
2. [Feature after that] — TRD §[X]

## ⚠️ Open Decisions (Human-in-the-Loop Required)
- [ ] [Decision needed, e.g., "RI API SOAP vs REST endpoint confirmed?"]
- [ ] [Another pending decision]

## 🚫 Known Constraints
- Do NOT implement [X] until [Y] is resolved
- [Other guardrails for the next agent session]
```

### Context Recovery Protocol (After `/clear` or New Session)

When starting a new session, the **first action** before any code is written must be:
Read @.agents/docs/PWF/progress.md

Read @.agents/docs/TRD_VeriFinca.md §[section relevant to next task]

Read @.agents/docs/ARCHITECTURE.md [relevant diagram section]

Read @.agents/docs/AGENTS.md

THEN: ask the human to confirm "Next Up" item before proceeding

An agent that skips step 1 and starts coding without reading `.agents/docs/PWF/progress.md` is operating context-blind and **must be stopped**.