---
id: error-digest
description: Summarize error patterns to surface top recurring root causes.
requires_mcps:
  - mcp-context7-mcp
---

# /error-digest — Error Digest Generation

## Pre-conditions
## Infrastructure Prerequisites
- Active MCP servers required: `mcp-context7-mcp`
  - GATE: Verify active server connection using scanner. If FAIL → stop and report. Do NOT proceed. MAX_RETRIES: 3.

## Steps

0. **Initialize Planning Files** (@planning-with-files)
   - Create the isolated session directory at `.agents/sessions/<id_sesion>/`.
   - Populate with workflow ID `error-digest`, objectives, and checklist.
   - GATE: Directory and base planning files exist. If FAIL → stop and report. Do NOT proceed. MAX_RETRIES: 3.

1. Read `.agents/sessions/<id_sesion>/error-patterns.md`.
   - GATE: Error patterns successfully loaded. If FAIL → stop and report. Do NOT proceed. MAX_RETRIES: 3.

2. Send to Groq: "Summarize these error patterns. Surface the top 3 recurring root causes and their recommended fix strategies."
   - GATE: Summary generated with top 3 root causes and strategies. If FAIL → stop and report. Do NOT proceed. MAX_RETRIES: 3.

3. Output digest to `.agents/sessions/<id_sesion>/error-digest.md`.
   - GATE: Digest written to `.agents/sessions/<id_sesion>/error-digest.md` correctly. If FAIL → stop and report. Do NOT proceed. MAX_RETRIES: 3.

4. Surface in next planning brief.
   - GATE: Digest presented in the next planning brief. If FAIL → stop and report. Do NOT proceed. MAX_RETRIES: 3.
