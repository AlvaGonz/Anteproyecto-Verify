---
trigger: always_on
---

# Rule: antigravity-skill-orchestrator

**Scope:** Any agent invocation of `@antigravity-skill-orchestrator` in this workspace  
**Skills invoked:** `antigravity-skill-orchestrator` · `antigravity-workflows` · `agent-memory-mcp` · `planning-with-files` · `ponytail` · `ponytail-*`  
**Risk level:** Safe-by-design, but meta — orchestration mistakes can fan out into many files

---

## 1. Ponytail-First Orchestration (Lazy Senior Guardrail)

The orchestrator MUST behave like a lazy senior dev: smallest correct move, minimal orchestration.

Before doing anything fancy with skills or workflows, climb this ladder:

1. **YAGNI check:** Ask “Does this need a skill at all?”
   - If the task is a small, local edit (e.g. tweak one function, adjust one config, fix a typo), **do not** invoke any skill.
   - Solve it directly using basic file edits, search, and terminal commands.

2. **Reuse check:** If orchestration *is* needed:
   - Look for existing plans, scripts, or skills already used for similar tasks via:
     - `agent-memory-mcp` combinations.
     - `.agents/docs/PWF/task_plan.md` and `findings.md`.
   - Prefer reusing a known combination over inventing a new one.

3. **Stdlib / existing capability check:**
   - If a built-in MCP, existing CLI, or pipeline already solves it, call that directly instead of spinning up new skill combos.

Only after these checks fail should the orchestrator actually coordinate skills.

**Forbidden:**

- Spawning a multi-skill orchestration for trivial edits.
- Creating abstractions (new skills, new layers of indirection) that were not explicitly requested.
- Adding new dependencies or tools when an MCP or existing script covers the need.

If in doubt, the orchestrator MUST ask the user:  
> “Do you actually need orchestrated skills here, or will a small direct change in `<file>` be enough?”

---

## 2. Task Evaluation & When NOT to Orchestrate

The orchestrator is **strictly forbidden** from over-engineering simple tasks.

### 2.1 Simple / Contained Tasks (No Orchestration)

Examples:

- “Rename this variable in one file.”
- “Change this button label / one CSS rule.”
- “Log this error with more context in a single handler.”

For these, the correct behavior is:

- No `scanner.mjs`, no `registry.mjs`, no `@antigravity-workflows`.
- Read the relevant files, apply the smallest correct diff, and leave a single runnable check if the change is non-trivial.

### 2.2 Complex / Multi-Domain Tasks (Orchestration Allowed)

Only if ALL are true:

1. The task has **many moving parts** or unclear skill mapping.
2. Multiple domains are involved (e.g. React + backend + CI + security).
3. The user explicitly wants “best tools”, “combine skills”, or “orchestrate” a non-trivial change.

Then the orchestrator may proceed with dynamic skill discovery and selection (Sections 3–5).

The orchestrator MUST NOT create new skills; it only combines and executes existing ones.

---

## 3. Multi-Phase Delegation to `antigravity-workflows` (DAG & Anti-Loop)

If the task meets ALL of these criteria:

1. Requires **3+ sequential phases** (for example: Plan → Build → Test → Deploy).
2. Spans multiple skill categories (e.g. architecture, development, testing, workflow).
3. Would require **3 or more** individual skills in sequence.

Then the orchestrator MUST NOT orchestrate each skill manually.

Instead:

1. Delegate downwards to `@antigravity-workflows` with the full objective.
2. Let `antigravity-workflows`:
   - Choose the best matching workflow from `docs/WORKFLOWS.md` / `data/workflows.json`, or synthesize a new one.
   - Use `planning-with-files` for `.agents/docs/PWF/task_plan.md`.
   - Enforce gates and resumable execution.

**Critical DAG Rule:**

- Hierarchy is strictly:

  ```text
  @antigravity-workflows   ← multi-phase pipelines
  @antigravity-skill-orchestrator   ← single-phase skill combos
  atomic skills (@react-patterns, @tdd, etc.)
  ```

- The orchestrator may delegate **down** to `@antigravity-workflows`.
- A workflow is **forbidden** from calling `@antigravity-skill-orchestrator` back up the stack, directly or indirectly.
- If any workflow phase fails, the agent must:
  - Report the failure and current state.
  - Ask for human guidance or mark the phase as MANUAL.
  - Never try to resolve that failure by calling `@antigravity-skill-orchestrator`.

---

## 4. Dynamic Skill Discovery (SkillScanner) — Minimal & Reused

When orchestration is justified:

1. Run the SkillScanner **once per session** unless the workspace changes:

   ```bash
   node .agents/skills/antigravity-skill-orchestrator/scripts/scanner.mjs --pretty
   ```

   The scanner:

   - Reads local skills from `<workspace>/.agents/skills/` (preferred).
   - Reads global skills from `~/.gemini/config/skills/`.
   - Extracts only frontmatter from `SKILL.md` (name, description, category, tags).
   - Deduplicates by name (local overrides global).
   - Also discovers active MCP servers from known config JSONs. [file:107]

2. The orchestrator MUST NOT re-run the scanner repeatedly for the same request unless:
   - The user explicitly asks to rescan, or
   - A new skill directory was added.

3. For subsequent decisions during the same orchestration, reuse the last scanner output (lazy senior reuse).

---

## 5. Structured Skill Selection (DynamicSkillRegistry) — No Hallucination

To choose skills:

1. Feed scanner output into the registry builder:

   ```bash
   node .agents/skills/antigravity-skill-orchestrator/scripts/scanner.mjs --pretty \
     | node .agents/skills/antigravity-skill-orchestrator/scripts/registry.mjs
   ```

2. Use the resulting manifest:

   - `tool_schema.name = "invoke_skill"` with `skill_name` as an enum of discovered names.
   - `skill_descriptions` and `skill_sources` for reasoning.
   - `active_mcp_servers` summarizing available MCP tools. [file:109]

3. All skill selection MUST go through this schema:

   ```json
   {
     "tool": "invoke_skill",
     "parameters": {
       "skill_name": "<one-of-enum>",
       "reason": "Why this is the best choice"
     }
   }
   ```

4. Forbidden:

   - Referencing any skill name not present in the `enum`.
   - Assuming a skill exists because “it’s in the catalog” without scanner confirmation.
   - Selecting more than the minimal set of skills needed (Ponytail: shortest working diff).

---

## 6. MCP-Aware Orchestration (Check Capabilities First)

Before selecting any skill:

1. Inspect `active_mcp_servers` from the registry output. [file:109]
2. Map required capabilities (DB access, GitHub, design tokens, browser QA, etc.) to actual active MCPs.
3. If a required domain has **no active MCP server**:
   - Block with a clear message:
     > “MCP gap: need `<domain>` capability (e.g. DB or PR access) but no active MCP server is available. Please enable `<server>` or adjust the task.”
   - Do not proceed with skills that would be guessing schema or external state.

Prefer MCP-backed operations over local guesses or mock data.

---

## 7. Knowledge Tracking — Only When It Pays Off

The orchestrator tracks useful combinations, but under Ponytail constraints:

1. Use `agent-memory-mcp` to store a combination **only** if:
   - The task was genuinely complex.
   - The combination is likely to be reused (e.g. “React dashboard + Vitest + Playwright for this stack”).

2. Write memories with domain-based keys and clear content:
   - `combination-verifinca-ci-hardening`
   - `combination-react-dashboard-performance`

3. Use `planning-with-files` minimally but reliably:

   - `task_plan.md` — high-level phases and which skills were used.
   - `findings.md` — non-trivial discoveries about skills or stack behavior.
   - `progress.md` — checkpoints; especially after completing a phase or workflow gate.

Do not spam memory with one-off micro-combinations.

---

## 8. Ponytail Constraints on Orchestrated Skills

When the orchestrator picks a skill (or a small set) to run:

- Prefer the skill that yields the **smallest working change**, not the most “fancy”.
- Question complex, boilerplate-heavy skills:
  - “Do we actually need full scaffolding here, or can we patch the existing function with a small diff?”
- For bug fixes, focus on root cause:
  - Prefer skills that help trace shared callers and fix the common path once, not patch every symptom call site.

Non-trivial orchestration results MUST leave behind **one runnable check**:

- A test, script, or assertion that will fail if the orchestrated logic breaks.
- No heavy frameworks or fixtures for tiny changes.

---

## 9. Remote Catalog — Last Resort

If local + global skills cannot cover the complex task:

1. Fetch `https://raw.githubusercontent.com/sickn33/antigravity-awesome-skills/main/CATALOG.md` as a reference.
2. Use it to identify candidate skills.
3. Only then, and only if the skill is actually installed (confirmed by scanner), bring it into play.

The catalog is advisory; the scanner remains the source of truth for what can be invoked.

---

## 10. Self-Check Before Orchestrated Changes

Before finishing any `@antigravity-skill-orchestrator` run:

- [ ] Confirm the task truly needed orchestration (was not a simple edit).
- [ ] If multi-phase (3+), confirm you delegated to `@antigravity-workflows` instead of manually chaining many skills.
- [ ] Confirm all skills invoked came from the registry’s `skill_name` enum.
- [ ] Confirm MCP capabilities were checked and no domain was operated on blindly.
- [ ] Confirm the smallest effective set of skills was used.
- [ ] Confirm at least one runnable check or test exists for non-trivial logic changes.
- [ ] If combinations are recorded, ensure they are high-value and clearly named.
- [ ] Confirm no meta-loop: workflows never called the orchestrator, and control only flowed downward.
