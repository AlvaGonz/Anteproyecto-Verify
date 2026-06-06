---
name: antigravity-skill-orchestrator
description: "A meta-skill that dynamically discovers available skills from local and global directories, evaluates task complexity, selects the optimal skill combination via structured Tool Calling, and tracks decisions using agent-memory-mcp and planning-with-files."
category: meta
risk: safe
source: community
tags: "[orchestration, meta-skill, dynamic-discovery, tool-calling, agent-memory]"
date_added: "2026-03-13"
date_updated: "2026-06-02"
---
# antigravity-skill-orchestrator

## Overview

The `skill-orchestrator` is a meta-skill designed to enhance the AI agent's ability to tackle complex problems. It acts as an intelligent coordinator that:

1. **Dynamically discovers** all available skills from the local workspace (`.agent/skills/`) by scanning SKILL.md frontmatter metadata.
2. **Evaluates task complexity** to prevent over-engineering simple requests.
3. **Selects the optimal skill** using a structured Tool Calling pattern.
4. **Tracks successful combinations** using `@planning-with-files` for session-level file-based working memory.

## When to Use This Skill

- Use when tackling a complex, multi-step problem that likely requires multiple domains of expertise.
- Use when you are unsure which specific skills are best suited for a given user request.
- Use when the user explicitly asks to "orchestrate", "combine skills", or "use the best tools for the job" on a significant task.

## Core Concepts

### Task Evaluation Guardrails

Not every task requires a specialized skill. For straightforward issues (e.g., small CSS fixes, simple script writing), **DO NOT USE** specialized skills. Over-engineering simple tasks wastes tokens and time.

Before invoking any skills, evaluate the task:
1. **Is the task simple/contained?** Solve it directly using the agent's ordinary file editing, search, and terminal capabilities.
2. **Is the task complex/multi-domain?** Only then should you proceed to orchestrate skills.

### Multi-Phase Delegation Rule

If the task requires 3+ sequential phases, spans multiple domains, and requires 3+ individual skills:
- Invoke `@antigravity-workflows` and pass the user's full objective to it.

Hierarchy:
```
@antigravity-workflows       <- Multi-phase pipelines
@antigravity-skill-orchestrator  <- Single-phase skill combos
Individual Skills            <- Atomic capabilities
```

### Strict Anti-Loop Guardrail (Mandatory)

1. The **Orchestrator** may delegate complex tasks to the **Workflows** engine.
2. **Workflows** execute atomic, domain-specific **Skills**.
3. **CRITICAL**: A Workflow is strictly forbidden from delegating tasks back upwards to the Orchestrator.

## Step-by-Step Guide

### Step 0: Discover Available Skills

1. Scan `.agent/skills/` directory for all SKILL.md files.
2. Extract YAML frontmatter metadata (name, description, category, tags).
3. Review the output to understand your available toolbox before making any selection.

### Step 1: Task Evaluation & Guardrail Check

1. Read the user's request.
2. Ask yourself: "Can I solve this efficiently with just basic file editing and terminal commands?"
3. If **YES**: Proceed without invoking specialized skills.
4. If **NO**: Proceed to Step 2.

### Step 2: Select Skills

1. Analyze the core requirements.
2. Cross-reference against the discovered skill registry.
3. Select the **minimal set** of skills needed. **Do not over-select.**

### Step 3: Execute the Selected Skill

1. Read the full `SKILL.md` of the selected skill.
2. Follow the skill's instructions exactly as documented.
3. If multiple skills are needed, execute them in logical dependency order.

## Best Practices

- Always evaluate task complexity **before** looking for skills.
- Keep the number of orchestrated skills as small as possible.
- Never use this skill for simple bug fixes or UI tweaks.
- Never attempt to construct, generate, or create new skills.

## Related Skills

- `@antigravity-workflows` — Highest-level meta-skill for orchestrating multi-phase workflows.
- `@planning-with-files` — Session-level file-based working memory.
