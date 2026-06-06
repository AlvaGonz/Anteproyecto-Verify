```markdown
# Anteproyecto-Verify Development Patterns

> Auto-generated skill from repository analysis

## Overview

This skill teaches the core development patterns and workflows used in the Anteproyecto-Verify repository, a TypeScript project built with the Vite framework. It covers coding conventions, commit style, workflow automation, dependency management, and testing approaches. By following these guidelines, contributors can ensure consistency, maintainability, and security throughout the codebase.

## Coding Conventions

**File Naming**
- Use camelCase for file names.
  - Example: `userProfile.ts`, `authService.test.ts`

**Import Style**
- Use relative imports for internal modules.
  - Example:
    ```typescript
    import { validateUser } from './utils/validateUser';
    ```

**Export Style**
- Prefer named exports.
  - Example:
    ```typescript
    // In userService.ts
    export function getUser(id: string) { ... }
    export const USER_ROLE = 'admin';
    ```

**Commit Messages**
- Use [Conventional Commits](https://www.conventionalcommits.org/).
- Prefixes: `feat`, `fix`, `ci`, `chore`
- Example:
  ```
  feat(auth): add JWT token validation to login flow
  fix(profile): correct avatar rendering on mobile
  ```

## Workflows

### Update Workflow Definition and Documentation
**Trigger:** When adding or updating a workflow for agent automation  
**Command:** `/update-workflow`

1. Edit or add workflow markdown file(s) in `.agents/workflows/`.
2. Update `workflows.json` in `.agents/skills/antigravity-workflows/data/`.
3. Update or create documentation in `.agents/skills/antigravity-workflows/docs/WORKFLOWS.md`.
4. Update `skills-lock.json` if necessary.
5. Commit all changes together to keep definitions, docs, and lock files in sync.

**Example:**
```bash
# Add a new workflow
vim .agents/workflows/new-agent-workflow.md

# Update the JSON data
vim .agents/skills/antigravity-workflows/data/workflows.json

# Update documentation
vim .agents/skills/antigravity-workflows/docs/WORKFLOWS.md

# Update lockfile if needed
vim skills-lock.json

git add .
git commit -m "feat(workflow): add new agent workflow and update docs"
```

---

### Security Pipeline CI Hardening
**Trigger:** When improving CI security or updating action versions/hashes  
**Command:** `/update-security-pipeline`

1. Edit `.github/workflows/security-pipeline.yml` to pin or update action versions/hashes.
2. Optionally add or update `.github/dependabot.yml` for automated dependency checks.
3. Commit changes to ensure the CI pipeline is secure and up to date.

**Example:**
```yaml
# .github/workflows/security-pipeline.yml
- uses: actions/checkout@v4
- uses: actions/setup-node@v3
```
```bash
git add .github/workflows/security-pipeline.yml .github/dependabot.yml
git commit -m "ci(security): pin action versions and update dependabot config"
```

---

### Meta-Skill Orchestrator Update
**Trigger:** When improving orchestrator logic or enforcing new execution rules  
**Command:** `/update-meta-skill`

1. Edit `SKILL.md` in orchestrator and workflows directories.
2. Update `.agents/loop-run-counter.txt` for loop/guardrail tracking.
3. Commit changes to ensure orchestrator follows new rules.

**Example:**
```bash
vim .agents/skills/antigravity-skill-orchestrator/SKILL.md
vim .agents/skills/antigravity-workflows/SKILL.md
vim .agents/loop-run-counter.txt

git add .
git commit -m "chore(orchestrator): update SKILL docs and loop counter"
```

---

### Dependency and Lockfile Update
**Trigger:** When patching vulnerabilities or fixing dependency-related CI/build errors  
**Command:** `/update-deps`

1. Edit `package.json` and/or `src/frontend/web/package.json` to update dependencies.
2. Update `pnpm-lock.yaml` to reflect new dependency versions.
3. Commit changes to lockfiles and related config.

**Example:**
```bash
pnpm update
git add package.json pnpm-lock.yaml src/frontend/web/package.json
git commit -m "fix(deps): update dependencies and lockfile for security patch"
```

## Testing Patterns

- Test files use the `*.test.*` pattern (e.g., `userService.test.ts`).
- The specific testing framework is not specified; check for `jest`, `vitest`, or similar in `package.json`.
- Tests are colocated with source files or in dedicated test directories.

**Example:**
```typescript
// userService.test.ts
import { getUser } from './userService';

test('should fetch user by ID', () => {
  expect(getUser('123')).toEqual({ id: '123', name: 'Alice' });
});
```

## Commands

| Command                  | Purpose                                                        |
|--------------------------|----------------------------------------------------------------|
| /update-workflow         | Add or update agent workflow definitions and documentation      |
| /update-security-pipeline| Update and secure CI pipeline configurations                   |
| /update-meta-skill       | Update orchestrator logic, docs, and guardrail tracking        |
| /update-deps             | Update dependencies and lockfiles to patch vulnerabilities     |
```
