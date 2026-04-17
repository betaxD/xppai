# XppAI - AX 2009 & X++ Skill Suite for Claude Code

A set of focused skills for Microsoft Dynamics AX 2009 and X++ development.

WIP - be kind ;)

## Installation

Copy the skill folders into your `~/.claude/skills/` directory. All skills are ready to use immediately.

The skills are written as focused prompt files. They work with any agent or prompt-based workflow that supports loading context from files.

And yes: `xppai-papai` is called that on purpose.
In Portuguese, it sounds like **"papai"** which matches the tone of the project: a more experienced helper looking at the mess with you and helping you figure out what matters.

## What this repo is

A collection of focused AX 2009 / X++ skills for:

- understanding unfamiliar code
- analyzing stack traces and profiler output
- reviewing change risk
- inspecting posting and FormLetter behavior
- suggesting conservative fixes
- giving broader, structured analysis when an artifact is messy or mixed
- adding project code documentation tags to approved XPO changes

## What this repo is not

- not an AX runtime tool
- not a compiler
- not a test framework
- not a D365FO toolkit
- not a guarantee that every suggested fix is correct

Use it as an analysis aid, not as automatic truth.

## Included skills

### `xppai-init`
Shared AX 2009 / X++ foundation used as base context.

### `xppai-explain`
Helps explain unfamiliar methods, classes, forms, tables, and other AX artifacts.

### `xppai-stack`
Focused on stack traces, profiler traces, and call-flow analysis.

### `xppai-codefix`
Suggests conservative fixes based on the context provided.
Review everything before applying it.

### `xppai-architect`
Looks for architectural weaknesses, design issues, and maintainability concerns.

### `xppai-posting`
Focused on posting flows, FormLetter behavior, and transaction-sensitive logic.

### `xppai-risk`
Assesses change risk before code is modified.

### `xppai-babysit`
A broader structured analysis skill for pasted artifacts.

### `xppai-papai`
The "senior helper" of the suite.
Best for mixed, ambiguous, or messy artifacts where the analysis needs judgment instead of a rigid checklist.

### `xppai-tagReview`
Compares two XPO exports - an original baseline and an approved/tested version - identifies what changed, and wraps each change in project code documentation tags. Asks for confirmation before tagging each block. Never modifies business logic.

### `xppai-help`
Lists available skills and when to use each one. Start here if you're not sure which skill to invoke.

## Scope

- Microsoft Dynamics AX 2009
- X++
- prompt-based analysis and review

## Constraints

- AX 2009 / X++ only
- no D365FO / modern AX scope
- localization blocks such as `<GBR>`, `<GIN>`, `<GJP>`, `<GSA>`, and `<GTH>` should not be modified
- some skills expect `xppai-init` as shared background

## License

MIT - see [LICENSE](LICENSE).
