# VeriFinca — Agent Progress Tracker
> Last updated: 2026-06-29T20:00:00-04:00 by DocWriter v1.0 (QA Roadmap from To-do.txt)
> **📝 Updated by DocWriter — QA Backlog appended below.**

## ✅ Completed Features
| Feature | TRD Section | Branch | Commit SHA | Date |
|---|---|---|---|---|
| Fix ERR_PACKAGE_PATH_NOT_EXPORTED & Node20 Deprecation | N/A | feat/agent-infrastructure-hardening | 74651a23 | 2026-06-06 |
| Fix react-i18next resolution in container | N/A | develop | bd5fc58f | 2026-06-06 |
| Remove 'remember me' checkbox | N/A | develop | 57ce09b9 | 2026-06-06 |
| Fix Project Photo Persistence | N/A | feat-codebase-memory-mcp | b64c1f53 | 2026-06-29 |
| AGENTS.md v5 — codebase-memory-mcp §0 mandatory | N/A | feat-codebase-memory-mcp | 6131fa9a | 2026-06-29 |
| README.md full rewrite from codebase graph | N/A | feat-codebase-memory-mcp | efcbffa5 | 2026-06-29 |
| E2E Test Success for Project Photos | N/A | feat-codebase-memory-mcp | 5661d1a6 | 2026-06-29 |

## 🔄 In Progress
| Feature | TRD Section | Status | Blocker |
|---|---|---|---|

## 🔜 Next Up (Prioritized)
1. Complete verification steps.

## ⚠️ Open Decisions (Human-in-the-Loop Required)
- None

## 🚫 Known Constraints
- None

---

## 📋 QA Backlog (from To-do.txt)
| Priority | Count | Items |
|---|---|---|
| 🔴 P0 — Critical | 6 | WBS-001..006 — Routes rotas + E2E tests |
| 🟠 P1 — High | 8 | WBS-007..014 — Security, Compliance, 17 UIs |
| 🟡 P2 — Medium | 5 | WBS-015..019 — UX mejoras |
| 🟢 P3 — Tech Debt | 10 | TEC-001..010 — Accesibilidad, rendimiento, CI |

## 🔄 In Progress (QA Roadmap Phase 0)
| WBS | Item | Agent | ETA |
|---|---|---|---|
| WBS-001 | Fix /#/register | developer-agent | Next |
| WBS-002 | Fix /#/proyectos | developer-agent | Next |
| WBS-003 | Fix /#/dashboard | developer-agent | Next |
| WBS-004 | Fix /#/legal | developer-agent | Next |

## ⚠️ Open Decisions (Human-in-the-Loop Required)
- [ ] JWT migration from localStorage to HttpOnly cookies (SEC-001)
- [ ] Consent UI implementation approach (COMP-001, Law 172-13)
- [ ] Public endpoint changes for Precios page (BUG-005)

## 🔄 Expanded Scope (Post-Audit — 2026-06-29)
| New ID | Item | Priority | RF | OE |
|--------|------|----------|----|----|
| WBS-020 | Sello Digital endpoint + QR (Law 126-02) | P1 | RF-10 | OE-7 |
| WBS-021 | Documentary Diagnosis UI + Rules Engine | P1 | RF-2 | OE-1 |
| TEC-011 | DataRetentionPurgeJob (30d/90d/7yr) | P3 | RNF-5 | OE-6 |
| TEC-012 | Availability monitoring + health checks | P3 | RNF-3 | General |
| TEC-013 | Load testing target with k6 | P3 | RNF-4 | General |

**Audit findings resolved:** RF-2 gap, RF-10 gap, RNF-3/4/5 gaps, PERF-001 reclassified P1, OE traceability corrected, "47 requisitos" source clarified.

> Updated: 2026-06-29T20:30:00-04:00 by DocWriter v1.0 (Post-Audit Patch — +5 items, 34 total)
