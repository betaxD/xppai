---
name: xppai-papai
description: Use when given any X++ AX 2009 artifact and you need an intelligent senior-engineer analysis — reads the artifact, reasons about what matters most, dynamically selects which skills to apply and in what order, and synthesizes findings into a practical assessment.
---

# XppAI Papai — Dynamic Senior Analysis Agent

Legacy Codex skill entry point for the canonical Papai agent definition at `assets/agents/xppai-papai/AGENT.md`.

**REQUIRED BACKGROUND:** Load `xppai-init` before applying this skill.

**MANDATORY PRE-STEP:** If input includes pasted XPO text or a `.xpo` file path, perform XPO intake at most once per user request before any analysis output.

## Overview

Use this skill as a compatibility wrapper. The canonical behavior lives in `assets/agents/xppai-papai/AGENT.md`.

Compact operating loop summary:

1. Define goal.
2. Inspect evidence.
3. Choose next action.
4. Use skill/tool.
5. Validate result.
6. Stop or continue.

Do not exceed 3 investigation cycles unless explicitly requested.

Only select skills that serve the user's prompt goal.

When the request begins as a business support symptom, operational error, or troubleshooting question without enough code or XPO evidence to justify artifact-first analysis, route first to `xppai-support`.

## XPO Intake Before Analysis

Before Step 1, check whether the artifact is XPO input (file path or pasted XPO text with object headers like `CLASS #`, `TABLE #`, `FORM #`).

- For XPO file path input: open the local `.xpo` file directly and read object text needed for this request.
- For pasted XPO text input: analyze directly from pasted text.
- If file open fails, continue only after user provides a corrected path or pasted content.
- Perform direct XPO intake at most once per user request.
- After successful intake, record and pass this state to selected skills: `XPO intake already completed for this request`.
- When applying selected skills, pass the completed intake state; selected skills must not perform intake again.
- Do not run unrelated shell commands to inspect repositories or discover context unless the user asked for that or local file access failed and diagnosis is required.

## Execution Decision Gate

After intake state is known, apply this gate before deeper analysis:

1. Confirm this request is XPO-analysis.
2. Use direct local-file/pasted-text evidence first.
3. Allow fallback to additional inspection only if:
   - file access failed, or
   - available text is insufficient for required evidence detail.
4. Papai enforces this gate through direct file/text inspection workflow.

Required output markers:

- `Path used: direct-file` or `Path used: fallback`
- If fallback is used: `Fallback reason: <file access failure|missing detail> - <concrete detail>`

For action definitions, validation rules, and stop conditions, follow `assets/agents/xppai-papai/AGENT.md`.

## Mandatory Compliance Gate (Do Not Skip)

Before final user-facing output, Papai must invoke `xppai-review` and enforce:

- Tag block compliance (`Tag ID`, `Project ID`, `Dev Name`, `DD/MM/YYYY`)
- No proposed edits inside localization blocks (`<GBR>`, `<GIN>`, `<GJP>`, `<GSA>`, `<GTH>`)

Execution contract:

1. Run `xppai-review` on the draft output.
2. If review returns `PASS`, continue.
3. If review returns `FAIL`, rewrite once to address failed checks and run `xppai-review` again.
4. If still `FAIL`, stop and return only the failed checks plus missing inputs needed to proceed safely.

Papai must never emit final fix code that fails `LOC-1` or tag checks (`TAG-1`, `TAG-2`, `TAG-3`).

## Export Integration

If the user asks to export analyzed objects to XPO files after assessment, invoke `xppai-exportxpo` with the object list. The skill generates a ready-to-paste X++ export job.

## Report Integration

If the user asks for a formal output document after analysis (change report, session handoff, or technical report), invoke `xppai-report` and generate the requested report type.
