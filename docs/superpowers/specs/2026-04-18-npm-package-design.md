# Design: xppai npm package

**Date:** 2026-04-18
**Branch:** chore/restructure-npm-package
**Status:** Approved

---

## Goal

Reorganise the xppai skill suite into a single npm-installable package named `xppai`. The package is LLM-runtime-agnostic: SKILL.md files are the canonical packaged source, and per-target adapters handle any transformation or installation needed for a specific runtime. Claude and Codex consume SKILL.md natively; Copilot is an export-only adapter with a transform step.

---

## Constraints

- Single package, not a monorepo
- No runtime npm dependencies
- No TypeScript, no build step — plain CommonJS
- Windows-friendly (junction symlinks, no elevation required)
- No postinstall side effects
- No writes to real user home directories during tests
- No large speculative changes — only what is needed to deliver the described structure

---

## File Layout

```
xppai/
├── package.json
├── README.md
├── CLAUDE.md
├── docs/superpowers/specs/        ← this file lives here
├── assets/
│   └── skills/
│       ├── xppai-architect/SKILL.md
│       ├── xppai-babysit/SKILL.md
│       ├── xppai-codefix/SKILL.md
│       ├── xppai-explain/SKILL.md
│       ├── xppai-help/SKILL.md
│       ├── xppai-init/SKILL.md
│       ├── xppai-papai/SKILL.md
│       ├── xppai-posting/SKILL.md
│       ├── xppai-risk/SKILL.md
│       └── xppai-stack/SKILL.md
├── bin/
│   └── xppai.js                   ← #!/usr/bin/env node, thin dispatcher
├── src/
│   ├── cli.js                     ← argv parsing + command dispatch
│   ├── assets.js                  ← list(), path()
│   ├── fs.js                      ← shared filesystem helpers
│   ├── commands/
│   │   ├── list.js
│   │   ├── path.js
│   │   ├── export.js
│   │   └── install.js
│   └── targets/
│       ├── claude.js
│       ├── codex.js
│       ├── copilot.js
│       └── generic.js
└── test/
    └── smoke.test.js
```

**Migration:** existing `xppai-*/SKILL.md` directories at the repo root move into `assets/skills/`. Content is preserved exactly.

---

## package.json

```json
{
  "name": "xppai",
  "version": "0.1.0",
  "description": "LLM-runtime-agnostic X++ AX 2009 skill suite",
  "license": "MIT",
  "bin": { "xppai": "./bin/xppai.js" },
  "files": ["assets/", "bin/", "src/"],
  "type": "commonjs",
  "scripts": {
    "test": "node --test test/smoke.test.js"
  },
  "engines": { "node": ">=18" }
}
```

- `"type": "commonjs"` — simplest zero-build choice; no transpilation required
- No runtime dependencies — `fs`, `path`, `os`, `child_process` from stdlib only
- `"files"` array explicitly controls what npm publishes

---

## CLI Commands

All normal output goes to **stdout**. All errors go to **stderr** with exit code 1.

### `xppai list`
Prints one skill name per line from `assets/skills/`. Machine-readable, no decoration.

### `xppai path`
Prints the absolute path to `assets/skills/` inside the installed package.

### `xppai export --target <target> --out <dir>`
Runs the named adapter's `export(skillsDir, outDir, opts)`. Creates `--out` if it doesn't exist. `--out` is always required. Fails clearly on unknown target.

### `xppai install --target <target> [--mode copy|symlink]`
Calls `adapter.resolveInstallDir(opts)`. If it returns null, exits 1 with:
```
error: target "<name>" does not define a default install location
use "xppai export --target <name> --out <dir>" instead
```
Otherwise calls `adapter.export(skillsDir, resolvedDir, opts)`. `--mode` defaults to `copy`.

**Arg parsing:** hand-rolled using `process.argv` in `src/cli.js`. No commander, no yargs.

---

## Adapter Contract

Every module in `src/targets/` exports:

```js
module.exports = {
  id: String,

  // Returns the default install path string, or null if this target is export-only.
  // install calls this; null causes a clear error and exit 1.
  resolveInstallDir(opts),

  // Returns the exact array of entry names (file or dir) this adapter writes into outDir.
  // Used to selectively remove stale owned entries before re-exporting.
  // Directory targets return dir names; file targets return file names.
  listOwnedEntries(skillsDir),

  // Core operation. Both export and install go through here.
  export(skillsDir, outDir, opts = {})
}
```

### Ownership rule inside `export()`
1. Call `listOwnedEntries(skillsDir)` to get the names this adapter will write
2. In `outDir`, remove only those names if they already exist
3. Write new entries
4. Leave all other entries in `outDir` untouched

This makes re-export idempotent and safe — user files are never touched.

### Per-target summary

| Target | `resolveInstallDir` | `listOwnedEntries` | Installable |
|---|---|---|---|
| `claude` | `~/.claude/skills` | skill dir names | yes |
| `codex` | `~/.agents/skills` | skill dir names | yes |
| `copilot` | returns `null` | skill `.md` file names | no — export-only |
| `generic` | returns `null` | skill dir names | no — export-only |

### `src/fs.js` helpers
- `expandHome(p)` — replaces leading `~` with `os.homedir()`
- `ensureDir(dir)` — `fs.mkdirSync(dir, { recursive: true })`
- `copySkill(src, dest)` — recursive directory copy
- `symlinkSkill(src, dest)` — `fs.symlinkSync(src, dest, 'junction')` on Windows, `'dir'` on POSIX
- `removeOwned(dir, entries)` — removes only the named entries from a directory

`'junction'` symlinks on Windows do not require elevation.

---

## Test Coverage (`test/smoke.test.js`)

Uses `node:test` and `node:assert`. No test framework dependencies.

### Category 1 — CLI smoke
- `node ./bin/xppai.js list` exits 0 and prints skill names to stdout
- `node ./bin/xppai.js path` exits 0 and prints a path string to stdout

### Category 2 — Asset discovery
- `assets.list()` returns an array containing all 10 expected skill names
- `assets.path()` returns a string that exists on disk

### Category 3 — Adapter contract shape
For each of `claude`, `codex`, `copilot`, `generic`:
- Module loads without throwing
- `id` is a non-empty string
- `resolveInstallDir`, `listOwnedEntries`, `export` are all functions
- `claude` and `codex` return a non-null string from `resolveInstallDir({})`
- `copilot` and `generic` return `null` from `resolveInstallDir({})`

### Category 4 — Generic export (real filesystem, temp dir)
- Create a temp dir with `fs.mkdtempSync`
- Call `adapter.export(assetsPath, tempDir, { mode: 'copy' })`
- Assert the set of entries in `tempDir` exactly matches `adapter.listOwnedEntries(assetsPath)` — no extras, no missing
- Assert each exported `SKILL.md` is non-empty
- Call `adapter.export(...)` a second time into the same temp dir
- Assert the result is identical (idempotent re-export)
- Clean up temp dir after

### Out of scope
- Writes to real home-directory install targets
- Symlink mode
- Copilot transform correctness
- Deep CLI parser unit tests
