# XppAI

**XppAI is an LLM-runtime-agnostic skill suite for X++ and Microsoft Dynamics AX 2009.**

It packages a curated set of AX 2009 / X++ skills into an installable CLI, so you can bring structured, senior-style analysis to old-school ERP codebases without locking yourself into one specific AI runtime.

Because yes: AX 2009 code still exists, it still runs businesses, and sometimes it needs more than "just ask the AI".

XppAI helps LLM agents understand AX 2009 code with better context, safer assumptions, and more production-aware behavior.

## Author

Created by **Roberta Freitas Oliveira** — **15+ years Microsoft ERP Specialist**  
LinkedIn: [linkedin.com/in/rfreitas90](https://www.linkedin.com/in/rfreitas90/)

## Why XppAI?

Modern AI tools are great at coding.

AX 2009 is not modern.

X++ has its own patterns, traps, conventions, transaction behaviors, localization blocks, posting flows, and "do not touch this casually" zones.

XppAI gives LLMs a better operating manual for this world.

## What It Helps With

- understanding unfamiliar X++ objects
- analyzing profiler traces and stack traces
- reviewing posting flows
- spotting risky changes before they hurt production
- proposing minimal, safe fixes
- exporting skills for different AI runtimes
- reading XPO files directly for analysis

## Included Skills

| Skill | Purpose |
|---|---|
| `xppai-papai` | **Main** dynamic senior orchestrator for mixed or complex artifacts |
| `xppai-babysit` | **Main** structured static orchestrator for predictable, labeled analysis |
| `xppai-init` | Shared AX 2009 foundation and guardrails |
| `xppai-explain` | Explains unfamiliar methods, classes, forms, and tables |
| `xppai-stack` | Analyzes profiler traces and stack traces |
| `xppai-codefix` | Proposes minimal, safe, production-ready fixes |
| `xppai-architect` | Reviews code for architectural weaknesses and design gaps |
| `xppai-posting` | Analyzes FormLetter posting flows and transaction behavior |
| `xppai-risk` | Assesses change risk before modifying code |
| `xppai-help` | General helper and entry guidance |
| `xppai-exportxpo` | Generates a ready-to-paste X++ job for exporting AOT objects to XPO files |

## Quick Start

### Requirements

- Node.js 18 or newer

### Install

```bash
npm install -g xppai
```

Or from source:

```bash
npm install -g .
```

### First Commands

```bash
xppai list
xppai install --target all
xppai xpo read --type Class --name MyClass --file <file>
xppai xpo grep --contains "search-text" --file <file>
```

Install one runtime at a time when needed:

```bash
xppai install --target codex
xppai install --target claude
xppai install --target qwen
xppai install --target copilot
```

## Supported Targets

### Native targets

- `claude`
- `codex`
- `qwen`
- `copilot`

For `copilot`, install writes GitHub Copilot CLI project skills under `.github/skills` inside the current repository.

### Export-only targets

- `generic`

## Learn More

- Documentation index: [docs/README.md](./docs/README.md)
- Skills guide: [docs/skills.md](./docs/skills.md)
- CLI and command behavior: [docs/cli.md](./docs/cli.md)
- XPO CLI workflow and notes: [docs/xpo-cache.md](./docs/xpo-cache.md)
- Targets and installation: [docs/targets.md](./docs/targets.md)
- Scope and constraints: [docs/scope.md](./docs/scope.md)

## Repository

GitHub: [betaxD/xppai](https://github.com/betaxD/xppai)

## Status

XppAI is built for people who still need to reason about AX 2009 seriously.

It will not make legacy ERP magically simple.

But it can make your AI assistant less clueless before it touches the code.
