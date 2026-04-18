# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Repo Is

XppAI is an npm-installable package that bundles a Claude Code skill suite for Microsoft Dynamics AX 2009 and X++ development. The package is LLM-runtime-agnostic: skills are SKILL.md files in `assets/skills/`, and target-specific adapters handle installation to Claude, Codex, Copilot, or generic paths.

## Development Workflow

```bash
node --test test/smoke.test.js       # run tests
node bin/xppai.js list              # list bundled skills
node bin/xppai.js path              # print assets/skills/ path
node bin/xppai.js export --target generic --out ./out  # export to a dir
node bin/xppai.js install --target claude              # install to ~/.claude/skills
```

Skills are plain Markdown files with YAML frontmatter. Edit `assets/skills/<name>/SKILL.md` directly. No build step.

The frontmatter format is:

```markdown
---
name: skill-name
description: one-line trigger description used by the skill dispatcher
---
```

## Architecture

### Package Structure

```
assets/skills/          ← canonical SKILL.md source (one dir per skill)
bin/xppai.js            ← CLI entry point (#!/usr/bin/env node)
src/assets.js           ← list(), path() — discovers packaged skills
src/fs.js               ← filesystem helpers (copy, symlink, ensureDir, removeOwned)
src/cli.js              ← argv parser + command dispatch
src/commands/           ← one file per CLI command (list, path, export, install)
src/targets/            ← one adapter per runtime (claude, codex, copilot, generic)
test/smoke.test.js      ← smoke tests (node:test, no dependencies)
```

### Adapter Contract

Every file in `src/targets/` exports:

```js
module.exports = {
  id: String,
  resolveInstallDir(opts),    // returns install path string, or null if export-only
  listOwnedEntries(skillsDir), // returns exact array of entry names this adapter writes
  export(skillsDir, outDir, opts)
}
```

`install` calls `resolveInstallDir`. If it returns `null`, the command fails with a message directing the user to `export --out` instead.

`export` removes only adapter-owned entries (from `listOwnedEntries`) before writing — unrelated files in the target directory are never touched.

### Installable vs Export-only Targets

| Target | Installable | Default location |
|---|---|---|
| `claude` | yes | `~/.claude/skills` |
| `codex` | yes | `~/.agents/skills` |
| `copilot` | no | use `--out` |
| `generic` | no | use `--out` |

### Skill Hierarchy

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
