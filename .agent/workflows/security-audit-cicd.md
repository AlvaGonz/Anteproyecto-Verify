---
id: security-audit-cicd
description: Perform a comprehensive Security Audit and implement a robust CI/CD pipeline with automated vulnerability scanning.
requires_mcps:
  - mcp-context7-mcp
  - mcp-github-mcp-server
---
# /security-audit-cicd — Security Audit & CI/CD Pipeline Integration

## Pre-conditions
- Active MCP servers required: `mcp-context7-mcp`, `mcp-github-mcp-server`
  - GATE: Verify active server connection using scanner. If FAIL → stop and report. Do NOT proceed. MAX_RETRIES: 3.
- Read `.agents/rules/user_global` and `.agents/docs/AGENTS.md`.

## Steps

0. **Initialize Planning Files** (@planning-with-files)
   - Create the isolated session directory at `.agents/sessions/<id_sesion>/`.
   - Populate `.agents/sessions/<id_sesion>/task_plan.md`, `.agents/sessions/<id_sesion>/findings.md`, and `.agents/sessions/<id_sesion>/progress.md` with the workflow ID `security-audit-cicd`, current objectives, and the checklist of steps below before touching any project files.
   - GATE: The directory `.agents/sessions/<id_sesion>/` and the base planning files (`task_plan.md`, `findings.md`, `progress.md`) exist and contain all initial steps. If FAIL → stop and report. Do NOT proceed. MAX_RETRIES: 3.

1. **Security Audit & Code Review** (@owasp-security)
   - Scan codebase for standard OWASP Top 10 vulnerabilities (dynamic queries, input validation gates, hardcoded secrets).
   - Read and parse `AUDIT.md` to extract historical findings and validation concerns.
   - GATE: Identify and document all security findings in `.agents/sessions/<id_sesion>/findings.md`. If FAIL → stop and report. Do NOT proceed. MAX_RETRIES: 3.

2. **Supply Chain & Dependency Audit**
   - Read `package.json`, root `Directory.Build.props`, and other dependency lock files to assess package versions, known CVEs, and insecure transitive packages.
   - GATE: Complete a mapping of the dependency list and potential vulnerabilities in `findings.md`. If FAIL → stop and report. Do NOT proceed. MAX_RETRIES: 3.

3. **CI/CD Pipeline Implementation**
   - Synthesize a comprehensive GitHub Actions workflow at `.github/workflows/security-pipeline.yml`.
   - Incorporate build checks, unit tests, dependency scanning, and static analysis security testing (SAST) gates.
   - GATE: `.github/workflows/security-pipeline.yml` is successfully created with correct syntax and robust configuration. If FAIL → stop and report. Do NOT proceed. MAX_RETRIES: 3.

4. **Verification & Performance Reporting** (@antigravity-workflows)
   - Perform a dry-run syntax and build validation of the created pipeline.
   - Populate the quantitative telemetry and qualitative performance metrics template, generating both `.agents/sessions/<id_sesion>/workflow_execution_report.md` and the final required `workflow_execution_report.md` in the root directory.
   - GATE: Execution reports are created successfully. If FAIL → stop and report. Do NOT proceed. MAX_RETRIES: 3.
