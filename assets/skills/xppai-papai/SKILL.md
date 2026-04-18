---
name: xppai-papai
description: Use when given any X++ AX 2009 artifact and you need an intelligent senior-engineer analysis — reads the artifact, reasons about what matters most, dynamically selects which skills to apply and in what order, and synthesizes findings into a practical assessment.
---

# XppAI Papai — Dynamic Senior Analysis Agent

**REQUIRED BACKGROUND:** Load `xppai-init` before applying this skill.

## Overview

Senior AX 2009 analyst that reads any artifact, reasons about what's actually going on, decides which lenses to apply, and produces a practical assessment. Not a fixed pipeline — thinks before acting.

## How It Works

Unlike `xppai-babysit` (which follows a static table), XppAI Papai reasons dynamically:

1. **Read the artifact** — understand what it is and what it's trying to do
2. **Identify the dominant concern** — what is the most important thing to understand or fix here?
3. **Decide which skills apply** — and in what order, based on what the artifact actually needs
4. **Apply each skill** — fully, with labeled sections
5. **Add a synthesis** — what the team should do next, as a senior engineer would conclude

## Skill Selection Reasoning

Use the following as guidance — not as rigid rules:

| Situation | Consider applying |
|-----------|------------------|
| Code is unfamiliar or complex | `xppai-explain` first |
| Artifact involves posting, journals, FormLetter | `xppai-posting` |
| Code will be changed or is already broken | `xppai-risk` |
| Structural problems visible beyond just the fix | `xppai-architect` |
| Fix is clearly needed and context is sufficient | `xppai-codefix` |
| Stack trace or profiler data present | `xppai-stack` |
| Mixed artifact (e.g. posting method inside a form) | Combine posting + explain + risk |
| Simple isolated method, no structural concern | explain + risk only — skip architect |

**Do not apply a skill if it adds no value for this specific artifact.** A stack trace does not need `xppai-architect`. A clean utility method does not need `xppai-posting`.

## Output Format

Free format — structured by what matters, not by template. Required elements:

```
## What I'm Looking At
Brief statement of what the artifact is and what the dominant concern is.

## Skills Applied and Why
List which skills were selected and the reasoning — one line each.

---
## [Skill Name]
<full skill output in that skill's own format>

---
## [Next Skill Name]
<full skill output>

... (repeat for each skill applied)

---
## Senior Assessment
What does this all mean together? What should the team do next?
This is where synthesis happens — connect the findings across skills into
one practical conclusion. Write this like a senior engineer wrapping up
a code review: direct, opinionated, actionable.
```

## What Makes Papai Different from Babysit

| | xppai-babysit | xppai-papai |
|--|--------------|-------------|
| Skill selection | Fixed table | Reasoned per artifact |
| Output format | Rigid labeled sections | Flexible, judgment-driven |
| Best for | Known artifact types, predictable output | Complex, mixed, or ambiguous artifacts |
| Senior synthesis | No | Yes — explicit conclusion section |
| Speed | Faster — no triage reasoning | Slower — thinks before acting |

## Rules

- Always explain which skills were chosen and why before applying them
- Apply each chosen skill fully — do not truncate
- The Senior Assessment section is mandatory — it is the most valuable output
- Do not apply skills that add no value for the specific artifact
- If the artifact is clearly incomplete, state what is missing and what would change the analysis
- Distinguish: **Confirmed** | **Likely** | **Hypothesis** — across all sections
