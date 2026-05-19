---
name: xppai-help
description: Use when asked what XppAI skills are available or how to use the XppAI suite.
---

# XppAI Help

## Available Skills

| Skill | Purpose |
|-------|---------|
| `xppai-core` | Shared AX 2009 core foundation — always load |
| `xppai-domain` | Deep analysis foundation for posting/performance/risk/architecture |
| `xppai-intake` | Canonical one-time XPO intake when XPO input is present |
| `xppai-explain` | Understand unfamiliar methods, classes, forms, or tables |
| `xppai-exportxpo` | Generate a ready-to-paste X++ job for exporting AOT objects to XPO files |
| `xppai-stack` | Analyze profiler traces and stack traces |
| `xppai-codefix` | Propose minimal, safe, production-ready code fixes |
| `xppai-architect` | Review code for architectural weaknesses and design gaps |
| `xppai-posting` | Analyze FormLetter posting flows and transactional behavior |
| `xppai-risk` | Assess change risk before modifying any code |
| `xppai-support` | Troubleshoot symptom-first AX 2009 support issues with a standard-first cause tree |
| `xppai-babysit` | Static orchestrator — paste any artifact, get a full labeled analysis |
| `xppai-papai` | Dynamic senior agent — reasons about what to apply and synthesizes findings |

## When to Use What

**Don't know where to start?** → `xppai-babysit` or `xppai-papai`

**Reading unfamiliar code?** → `xppai-explain`

**About to change something?** → `xppai-risk`

**Something is slow?** → `xppai-stack`

**Posting flow is broken or unclear?** → `xppai-posting`

**Functional/support issue with no code yet?** → `xppai-papai` (routes to `xppai-support` when appropriate)

**Need a fix?** → `xppai-codefix`

**Something smells architecturally wrong?** → `xppai-architect`

## XPO Intake Quick Rules

- New XPO file path provided: open the local `.xpo` directly before analysis skills
- XPO pasted as text: analyze directly from pasted content
- If local file access fails, ask for corrected path or pasted content
- If no new XPO is provided, continue using artifact text already in conversation context

## Code Tag Rules

- When fix output requires code tags, use `Tag ID` terminology (not SPS-specific wording).
- Required fields for tagged fixes: `Tag ID`, `Project ID`, `Dev Name`, and current date (`DD/MM/YYYY`).

## Commit Safety Rules

- Never include real customer XPO files or generated analysis reports in repository commits.
- Keep local runtime/config folders out of commits (for example `.claude/` and generated `reports/` output).
