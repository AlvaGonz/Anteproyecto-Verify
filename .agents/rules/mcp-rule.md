---
name: MCP Usage Guidelines
description: Outlines which MCP tools to use, when, and how to use them for VeriFinca.
---

# MCP Server Mandate

> **When to Use**: Apply these rules whenever a task involves reading existing context, data schemas, API contracts, or external state.

## Approved MCP Servers (In-Scope)

| MCP Server | When to Use | Inputs | Outputs | Constraints |
|---|---|---|---|---|
| **`codebase-memory-mcp`** | ALWAYS (start of session) | File names, paths, symbols | Codebase graph, imports, traces | MANDATORY: Must use before reading/editing files. |
| **`context7-mcp`** | When needing framework syntax | Tech stack (ASP.NET 8, React 19) | Live library documentation | Prefer over hallucinating syntax. |
| **`github-mcp-server`** | Managing PRs and Issues | Repository name, Issue ID, Branch | PR diffs, issue state, comments | Do not write code via GitHub MCP, only read/comment. |
| **`mssql`** | Database schema exploration | Query, Table Name | Live table schema | Use to prevent hallucinated columns. Do not modify data. |
| **`stripe`** | Billing logic, documentation | Search query, Stripe API resource | Stripe API docs, implementation plan | Read-only. Must align with `agents-payments.md` if present. |

## Do Not Use (Out of Scope)
Do not use or attempt to configure the following MCP servers, as they are not supported in this workspace:
- AWS, GCP, Azure standard resources (except via specific allowed MCPs)
- Unverified community MCPs
- Any MCP requiring local arbitrary code execution without human approval

## Tool Priority
1. **MCP Tools**: ALWAYS prefer MCP tools for information retrieval over local file search.
2. **Local Grep/Glob**: Fall back to local search only for string literals, error messages, or non-code files (Dockerfiles, configs).
