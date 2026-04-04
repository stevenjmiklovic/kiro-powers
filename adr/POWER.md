---
name: "adr"
displayName: "Architecture Decision Records"
description: "Create, maintain, and cross-reference Architecture Decision Records (ADRs) using MADR format. Infers decisions from git context, detects duplicates, manages supersession chains, and keeps an index file up to date."
keywords: ["adr", "architecture-decision-record", "madr", "architecture", "decision-log"]
author: "Steven Murawski"
---

# ADR Power

## Steering Files
- **workflow** — Create, update, review, cross-reference
- **generate-from-diff** — Auto-draft ADR from git diff
- **health-check** — Staleness detection, codebase cross-reference
- **team-review** — Review checklist, reviewer suggestions, promotion workflow
- **specs-integration** — ADR ↔ Kiro spec linking
- **changelog** — CHANGELOG.md for projects without fragment tools

## Shared Definitions

All steering files reference these. Defined once here.

### Directory
Search: `docs/adr/` → `docs/decisions/` → `docs/architecture/decisions/` → `docs/`. None → propose `docs/adr/`, confirm first.

### Naming
`ADR-{NNN}-{kebab-case-title}.md`

### Status
`Draft → Proposed → Accepted → Deprecated | Superseded by ADR-NNN`

### Git Context
Run before any drafting or analysis:
```bash
git log --oneline -20
git diff --stat HEAD~5..HEAD 2>/dev/null || git diff --stat HEAD
git rev-parse --abbrev-ref HEAD
```

### Index Maintenance
After every ADR write, update `README.md` in ADR directory:
- Exists → append/update row. Status change → update existing row.
- Missing → create with full table. Confirm first.
```markdown
| ADR | Title | Status | Date |
|-----|-------|--------|------|
| [ADR-001](./ADR-001-title.md) | Title | Accepted | YYYY-MM-DD |
```

### Cross-Referencing
- Supersession: update both files.
- Relation: add to Links of both.
- Verify all referenced ADR numbers exist.

### Changelog Check
After every ADR write:
1. Fragment tool found → use its format. See `changelog` steering for detection list.
2. CHANGELOG.md exists → append link. See `changelog` steering for format.
3. Nothing → offer to bootstrap. See `changelog` steering.

### Templates
See `workflow` steering, section 5.

## Rules
1. Git context before drafting
2. Duplicate-check before creating
3. Never silently rewrite accepted decisions
4. Supersession updates both ADRs
5. No dangling references
6. Update index after every write
7. Draft → confirm → write (never skip confirmation)
8. Changelog entries are links, not restatements

## Hooks

### agentStop — ADR Reminder
```json
{"name":"ADR Reminder","version":"1.0.0","when":{"type":"agentStop"},"then":{"type":"runCommand","command":"python3 -c \"\nimport subprocess\ntry:\n    r=subprocess.run(['git','diff','--stat','HEAD'],capture_output=True,text=True,timeout=5)\n    d=r.stdout.strip()\n    if d and any(p in d.lower() for p in ['.tf','.py','.yaml','.yml','schema','config','module','pipeline','lambda','iam']):\n        print('ADR reminder: architectural changes detected.')\nexcept Exception: pass\n\""}}
```

### preTaskExecution — Pre-Task Review
```json
{"name":"ADR Pre-Task Review","version":"1.0.0","when":{"type":"preTaskExecution"},"then":{"type":"askAgent","prompt":"Check if any ADRs in docs/adr/ relate to this task. Summarize briefly if found. Skip silently if no ADR directory."}}
```

### postTaskExecution — Post-Task Prompt
```json
{"name":"ADR Post-Task Prompt","version":"1.0.0","when":{"type":"postTaskExecution"},"then":{"type":"askAgent","prompt":"Run git diff --stat. Flag new modules, changed interfaces, or new dependencies as potential ADR candidates. Do not auto-create. Say nothing if purely implementation."}}
```

### fileCreated — New Module Check (optional)
```json
{"name":"ADR New Module Check","version":"1.0.0","when":{"type":"fileCreated","patterns":["**/modules/**/*.tf","**/src/**/commands/*.py","**/src/**/__init__.py"]},"then":{"type":"askAgent","prompt":"New architectural file created. Suggest ADR if new module/component. Say nothing if standard addition."}}
```

### userTriggered — Generate from Diff / Health Check / Team Review
```json
{"name":"Generate ADR from Diff","version":"1.0.0","when":{"type":"userTriggered"},"then":{"type":"askAgent","prompt":"Read generate-from-diff steering from adr power. Analyze git diff, classify changes, draft ADR with REVIEW markers, present for confirmation."}}
```
```json
{"name":"ADR Health Check","version":"1.0.0","when":{"type":"userTriggered"},"then":{"type":"askAgent","prompt":"Read health-check steering from adr power. Run full health check on all ADRs. Present actionable report."}}
```
```json
{"name":"ADR Team Review","version":"1.0.0","when":{"type":"userTriggered"},"then":{"type":"askAgent","prompt":"Read team-review steering from adr power. List Proposed ADRs, run checklist, suggest reviewers, present batch summary."}}
```

### Conditional Steering (optional `.kiro/steering/`)
```yaml
---
inclusion: fileMatch
fileMatchPattern: "docs/adr/**,docs/decisions/**,docs/architecture/**"
---
```
```yaml
---
inclusion: fileMatch
fileMatchPattern: ".kiro/specs/**"
---
```
