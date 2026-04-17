# XppAI — AX 2009 & X++ Skill Suite for Claude Code

A set of Claude Code skills specialized for Microsoft Dynamics AX 2009 and X++ development.

## Installation

Copy the skill folders into your `~/.claude/skills/` directory. All skills are ready to use immediately.

## Skills

| Skill | Purpose |
|-------|---------|
| `xppai-init` | Shared AX 2009 foundation — auto-loads on any X++ task |
| `xppai-explain` | Understand unfamiliar methods, classes, forms, or tables |
| `xppai-stack` | Analyze profiler traces and stack traces |
| `xppai-codefix` | Propose minimal, safe, production-ready code fixes |
| `xppai-architect` | Review code for architectural weaknesses and design gaps |
| `xppai-posting` | Analyze FormLetter posting flows and transactional behavior |
| `xppai-risk` | Assess change risk before modifying any code |
| `xppai-babysit` | Static orchestrator — paste any artifact, get a full labeled analysis |
| `xppai-papai` | Dynamic senior agent — reasons about what to apply and synthesizes findings |

## Usage

**Quick analysis:** paste any artifact (method, class, form XPO, stack trace) and invoke `xppai-babysit` for a structured multi-skill report.

**Deep analysis:** use `xppai-papai` for complex, mixed, or ambiguous artifacts — it reasons before acting and adds a senior synthesis at the end.

**Targeted use:** invoke individual skills directly when you know what you need.

## Constraints

- AX 2009 and X++ only — no D365 or modern AX
- Localization blocks (`<GBR>`, `<GIN>`, `<GJP>`, `<GSA>`, `<GTH>`) are never touched
- All skills load `xppai-init` as shared foundation
