# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Repo Is

XppAI is a Claude Code skill suite for Microsoft Dynamics AX 2009 and X++ development. It is not a traditional software project — there is no build system, test suite, or package manager. The entire codebase is a set of `SKILL.md` files that encode expert AX 2009 knowledge for delivery through Claude Code's skill system.

## Development Workflow

Skills are plain Markdown files with YAML frontmatter. To develop:

- Edit `SKILL.md` files directly
- Test by invoking the skill in Claude Code and verifying behavior manually
- No linting, compilation, or automated tests exist

Each skill directory contains exactly one `SKILL.md`. The frontmatter format is:

```markdown
---
name: skill-name
description: one-line trigger description used by the skill dispatcher
---
```

## Architecture

### Layered Skill Hierarchy

```
xppai-init          ← shared foundation (loaded by all skills)
    ↓
xppai-explain       ← understand code
xppai-stack         ← analyze profiler traces / stack traces
xppai-codefix       ← propose X++ fixes
xppai-architect     ← review for structural weaknesses
xppai-posting       ← FormLetter and posting flow analysis
xppai-risk          ← pre-change impact assessment
    ↓
xppai-babysit       ← static orchestrator (artifact type → fixed skill sequence)
xppai-papai         ← dynamic senior agent (reasons → selects skills → synthesizes)
xppai-help          ← user-facing skill reference
```

All specialist and orchestrator skills depend on `xppai-init`, which provides 12 shared knowledge domains covering AX 2009 architecture, X++ patterns, form lifecycle, transaction safety, performance hot paths, posting frameworks, and safe customization rules.

### Orchestrator Pattern

- **xppai-babysit** maps artifact types (stack trace, form XPO, posting code, class, method, table) to a fixed sequence of specialist skills. Produces a labeled multi-section report.
- **xppai-papai** reads the artifact first, reasons about the dominant concern, then selects and orders skills dynamically. Adds a senior synthesis conclusion.

## Hard Constraints (Encoded in xppai-init)

These apply to all code analysis and fix output — never violate them:

- **Localization blocks are untouchable.** Never modify code inside `<GBR>`, `<GIN>`, `<GJP>`, `<GSA>`, `<GTH>` tags. These are Microsoft-owned.
- **AX 2009 only.** No D365, no modern AX features.
- **Variable declarations at top of method.** AX 2009 requirement — no inline declarations.
- **Before proposing any fix via xppai-codefix:** collect SPS tag (Project ID, Developer name, Date DD/MM/YYYY), state exact object location (Class/Table/Form + Method + Layer), and flag any signature changes.
- **Evidence labels:** always distinguish Confirmed (in code) / Likely (inferred) / Unknown (missing context).

## Key AX 2009 Behaviors Encoded in Skills

These are the patterns most likely to cause bugs or performance issues — skills reason about them explicitly:

- `display` methods re-execute per visible row
- `active()` fires on every record navigation
- `modifiedField()` triggers tax calc → totals recalc → currency conversion cascades
- `PurchTotals.calc()` reads all lines — O(n²) if called per line
- `find()` in loops = O(n) reads; cache before loop
- `ttsAbort` at any nesting level rolls back all levels
- `FormLetter.run()` is framework-managed and fragile to override
