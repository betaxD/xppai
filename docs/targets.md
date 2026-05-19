# Targets and Installation

XppAI supports multiple runtime targets.

## Native Targets

These use packaged skill directories directly and support `install`:

- `claude`
- `codex`
- `qwen`

These install repository-local skills and support `install`:

- `copilot`

## Export-only Targets

These are adapted during export and currently do not expose a default install directory:

- `generic`

## Installation Examples

Install to a native target:

```bash
xppai install --target claude
```

Install to every supported runtime:

```bash
xppai install --target all
```

Symlink mode for development:

```bash
xppai install --target codex --mode symlink
```

Codex target installs to:

```text
~/.codex/skills
```

Claude target installs to:

```text
~/.claude/skills
```

Qwen target installs to:

```text
~/.qwen/skills
```

Copilot target installs GitHub Copilot CLI project skills to the current working repository:

```text
.github/skills/xppai-papai/SKILL.md
.github/skills/xppai-babysit/SKILL.md
.github/skills/xppai-init/SKILL.md
...
```

Run `xppai install --target copilot` from the repository where you want GitHub Copilot CLI to discover XppAI skills.
Verify installation in Copilot CLI with `/skills list`.

Export for manual use:

```bash
xppai export --target generic --out ./out/skills
```
