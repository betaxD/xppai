# CLI Reference

XppAI exposes a small command set focused on skill packaging and XPO analysis workflows.

## Core Commands

### `xppai list`

Print bundled skill names.

### `xppai path`

Print the installed path of packaged skills.

### `xppai export --target <target> --out <directory>`

Export skills for a target runtime into a directory.

### `xppai install --target <target> [--mode symlink]`

Install skills into a target runtime.

Use `--mode symlink` during development when you want local skill edits to reflect without repeated copy operations.

Supported install targets:

- `codex`
- `claude`
- `qwen`
- `copilot`
- `all`

`all` installs Codex personal skills, Claude Code personal skills, Qwen personal skills, and GitHub Copilot CLI project skills for the current working directory.

## XPO Commands

### `xppai xpo load <file> [--cache-dir <directory>]`

Load an XPO file into cache (optional CLI workflow).

### `xppai xpo load-stdin [--name <virtual-file-name>] [--cache-dir <directory>]`

Load pasted XPO text from `stdin` into cache (optional CLI workflow).

The command validates that pasted XPO content appears complete before writing cache.

When loading a new revision for the same source path, the command warns that the active cache entry is being overwritten.

### `xppai xpo snapshot [--file <path>] [--type <T>] [--limit <n>] [--json] [--cache-dir <directory>]`

Return a bounded inventory of the active XPO cache and record session authorization for that cache fingerprint.

### `xppai xpo list [--type <T>] [--file <path>] [--json] [--cache-dir <directory>]`

List cached object inventory from the latest cached extract per source file. For cache-query workflows, run `xppai xpo snapshot --json` first.

### `xppai xpo read --type <T> --name <N> [--file <path>] [--json] [--cache-dir <directory>]`

Read one cached object (including code content) by type/name. For cache-query workflows, run `xppai xpo snapshot --json` first.

### `xppai xpo grep --contains <text> [--type <T>] [--file <path>] [--limit <n>] [--json] [--cache-dir <directory>]`

Search cached object content using case-insensitive text matching. For cache-query workflows, run `xppai xpo snapshot --json` first.

### `xppai xpo cache-use <directory>`

Set active cache directory in user config.

### `xppai xpo cache-show [--cache-dir <directory>]`

Show resolved cache path and source (flag, user config, env, or default).

### `xppai xpo cache-copy <destination> [--yes] [--cache-dir <directory>]`

Copy current cache content to another location. If destination is non-empty, confirmation is required unless `--yes` is passed.

### `xppai xpo export-modified --out <directory> [--file <source-xpo-file>] [--cache-dir <directory>]`

Export one `.xpo` per changed/new object by comparing the latest and previous cache extracts for the same source file. For cache-query workflows, run `xppai xpo snapshot --json` first.

## Papai Direct-File Note

`xppai-papai` and related XppAI skills now prefer direct local-file XPO intake (or pasted XPO text) for analysis flows. The cache commands above remain available for manual CLI workflows and advanced comparisons.
