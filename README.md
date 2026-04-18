# XppAI

LLM-runtime-agnostic X++ and Microsoft Dynamics AX 2009 skill suite, packaged as an installable CLI.

XppAI bundles a curated set of AX 2009 / X++ skills and lets you:

- list bundled skills
- locate the installed skill bundle
- export skills for a target runtime
- install skills into supported runtimes

## Requirements

- Node.js 18 or newer

## Install

### Global install from npm

```bash
npm install -g xppai
```

### Local install from source

```bash
npm install -g .
```

## CLI

### List bundled skills

```bash
xppai list
```

Example output:

```
xppai-architect
xppai-babysit
xppai-codefix
xppai-explain
xppai-help
xppai-init
xppai-papai
xppai-posting
xppai-risk
xppai-stack
```

### Show installed asset path

```bash
xppai path
```

### Export skills for a target

```bash
xppai export --target <target> --out <directory>
```

Example:

```bash
xppai export --target generic --out ./out/skills
```

### Install into a supported target runtime

```bash
xppai install --target <target>
```

Optional symlink mode:

```bash
xppai install --target <target> --mode symlink
```

## Supported targets

### Native targets

These consume the packaged skill directories directly:

- claude
- codex

### Export-only targets

These are adapted during export and do not currently define a default install location:

- copilot
- generic

## Canonical asset format

The canonical packaged source is:

```
assets/skills/**/SKILL.md
```

XppAI keeps SKILL.md as the source of truth and uses target adapters to export or install the bundle for different runtimes.

## Included skills

| Skill           | Purpose                                                   |
|-----------------|-----------------------------------------------------------|
| xppai-init      | Shared AX 2009 foundation and guardrails                  |
| xppai-explain   | Explain unfamiliar methods, classes, forms, and tables    |
| xppai-stack     | Analyze profiler traces and stack traces                  |
| xppai-codefix   | Propose minimal, safe, production-ready fixes             |
| xppai-architect | Review code for architectural weaknesses and design gaps  |
| xppai-posting   | Analyze FormLetter posting flows and transaction behavior |
| xppai-risk      | Assess change risk before modifying code                  |
| xppai-babysit   | Structured multi-skill static analysis                    |
| xppai-papai     | Dynamic senior-style orchestration and synthesis          |
| xppai-help      | General helper and entry guidance                         |

## Project scope

XppAI is focused on:

- Microsoft Dynamics AX 2009
- X++
- performance analysis
- bug analysis
- posting flow analysis
- change-risk assessment
- safe production-oriented fixes

## Constraints

- AX 2009 and X++ only
- no D365 / Finance & Operations scope
- localization blocks such as `<GBR>`, `<GIN>`, `<GJP>`, `<GSA>`, and `<GTH>` should not be modified unless explicitly requested
- skills are intended to preserve existing logic and favor minimal, safe changes

## Development

Run tests:

```bash
npm test
```

Pack locally:

```bash
npm pack
```

## Repository

GitHub: [betaxD/xppai](https://github.com/betaxD/xppai)
