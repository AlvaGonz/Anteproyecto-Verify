```markdown
# Anteproyecto-Verify Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill outlines the core development patterns, coding conventions, and collaborative workflows for the Anteproyecto-Verify repository. The project is a TypeScript codebase built with Vite, emphasizing modular skills and workflows for agent-based systems. It follows conventional commit standards, enforces consistent code style, and integrates robust testing and security practices.

## Coding Conventions

- **File Naming:**  
  Use `camelCase` for file names.  
  _Example:_  
  ```
  agentScanner.ts
  skillRegistry.ts
  ```

- **Import Style:**  
  Always use relative imports.  
  _Example:_  
  ```typescript
  import { scanAgent } from './agentScanner';
  ```

- **Export Style:**  
  Use named exports for all modules.  
  _Example:_  
  ```typescript
  // skillRegistry.ts
  export function registerSkill(skill: Skill) { ... }
  ```

- **Commit Messages:**  
  Follow [Conventional Commits](https://www.conventionalcommits.org/):  
  - Prefixes: `feat`, `fix`, `refactor`, `ci`, `chore`, `test`
  - Keep messages concise (average ~79 characters)
  _Example:_  
  ```
  feat: add agent skill registry with dynamic loading
  fix: correct scanner path resolution in agent workflow
  ```

## Workflows

### Add or Update Agent Skill
**Trigger:** When introducing a new skill or updating an existing skill's logic or documentation  
**Command:** `/add-skill`

1. Create or update `SKILL.md` in `.agents/skills/<skill-name>/`.
2. Add or update supporting scripts (e.g., `scanner.mjs`, `registry.mjs`, `test-scanner.mjs`).
3. Update or add reference files (`examples.md`, `findings.md`, `progress.md`, `task_plan.md`).
4. Update documentation and templates as needed.
5. If relevant, update workflows or integration points.

_Example file structure:_
```
.agents/skills/skillName/
  ├── SKILL.md
  ├── scripts/
  │     ├── scanner.mjs
  │     └── registry.mjs
  ├── references/
  │     ├── examples.md
  │     └── findings.md
  └── templates/
        └── template.md
```

---

### Update or Add Agent Workflow
**Trigger:** When defining a new agent workflow or updating an existing workflow's steps or documentation  
**Command:** `/add-workflow`

1. Create or update workflow markdown files in `.agents/workflows/` or `.agent/workflows/`.
2. Update `workflows.json` or similar data files if the workflow is referenced programmatically.
3. Update `WORKFLOWS.md` or other summary documentation.
4. If relevant, update skill documentation to reflect new workflow capabilities.

_Example:_
```
.agents/workflows/scan-and-report.md
.agents/skills/skillName/data/workflows.json
.agents/skills/skillName/docs/WORKFLOWS.md
```

---

### Security Pipeline Hardening
**Trigger:** When enhancing CI/CD security or updating security pipeline dependencies  
**Command:** `/harden-security-pipeline`

1. Update `.github/workflows/security-pipeline.yml` to pin or update action SHAs/tags.
2. Add or update `dependabot.yml` for automated dependency updates.
3. Update or add related documentation or workflow markdown files.
4. Patch dependencies in `package.json` or `pnpm-lock.yaml` if needed.

_Example:_
```yaml
# .github/workflows/security-pipeline.yml
uses: actions/checkout@v3
```

---

### Codebase Audit and Refactor
**Trigger:** When refactoring core configuration, cleaning up the codebase, or generating an audit  
**Command:** `/codebase-audit`

1. Refactor configuration files (e.g., migrate `vite.config.js` to `vite.config.ts`).
2. Update `tsconfig` or related build configuration.
3. Generate or update `AUDIT.md` with codebase health or audit results.
4. Verify all tests pass and no legacy files remain.

_Example:_
```typescript
// vite.config.ts
import { defineConfig } from 'vite';

export default defineConfig({
  // Vite config options
});
```

---

### Dependency and Container Security Update
**Trigger:** When patching vulnerabilities or improving Docker/container security  
**Command:** `/update-dependencies`

1. Update `package.json` and `pnpm-lock.yaml` to patch vulnerabilities.
2. Update Dockerfiles and `docker-compose.yml` for improved security (e.g., run as non-root).
3. Suppress or address security scanner warnings (e.g., `.semgrepignore`).
4. Update related documentation or skill scripts if needed.

_Example:_
```dockerfile
# docker/Dockerfile
FROM node:18-alpine
USER node
```

## Testing Patterns

- **Framework:** [Playwright](https://playwright.dev/)
- **Test File Pattern:** All tests are placed in files matching `*.test.tsx`.
- **Example Test:**
  ```typescript
  // agentScanner.test.tsx
  import { test, expect } from '@playwright/test';
  import { scanAgent } from './agentScanner';

  test('should scan agent successfully', async () => {
    const result = await scanAgent('agent-123');
    expect(result).toBeTruthy();
  });
  ```

## Commands

| Command                | Purpose                                                          |
|------------------------|------------------------------------------------------------------|
| /add-skill             | Add or update an agent skill, including documentation and scripts|
| /add-workflow          | Create or modify agent workflows and documentation               |
| /harden-security-pipeline | Harden CI/CD security and update pipeline dependencies        |
| /codebase-audit        | Audit or refactor the codebase and update configuration          |
| /update-dependencies   | Patch dependencies and harden container security                 |
```