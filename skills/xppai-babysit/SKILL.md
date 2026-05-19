---
name: xppai-babysit
description: Use when given any X++ AX 2009 artifact — stack trace, method, class, form XPO, posting code, or table — and you need a full structured multi-skill analysis applied automatically based on artifact type.
---

# XppAI Babysit — Static Multi-Skill Orchestrator

**REQUIRED BACKGROUND:** Load `xppai-init` before applying this skill.

**MANDATORY PRE-STEP:** If input includes pasted XPO text or a .xpo file path, perform direct XPO intake at most once per user request before classification or analysis output.

## Overview

Paste any AX 2009 artifact. This skill detects what it is, applies the correct skill sequence, and produces clearly labeled sections — one per skill applied. No decisions required from the user.

## XPO Intake Before Classification

If input is an XPO file path or pasted XPO text (object headers such as `CLASS #`, `TABLE #`, `FORM #`), intake it first:

- File path: open the local `.xpo` file directly and read only required object text
- Pasted text: analyze directly from pasted content
- If file open fails, ask for corrected path or pasted content before classification
- Perform direct XPO intake at most once per user request.
- After successful intake, pass this state to selected skills: `XPO intake already completed for this request`.
- Selected skills must not perform intake again.

## Execution Decision Gate

1. Confirm intake state is known (or perform direct intake once).
2. If this request is XPO-analysis, use direct local-file/pasted-text evidence first.
3. Fallback inspection is allowed only if:
   - file access failed, or
   - available text is insufficient for required evidence detail.
4. Record compliance markers in output:
   - `Path used: direct-file` or `Path used: fallback`
   - if fallback used: `Fallback reason: <file access failure|missing detail> - <concrete detail>`

## Step 1 — Classify the Artifact

Read the artifact and identify its type. Use the first match:

| Artifact type | Signals |
|--------------|---------|
| **Stack trace / profiler** | Call stack lines, method depth, call counts, duration columns |
| **Posting code** | References to `FormLetter`, `ParmTable`, `ParmLine`, `calcTax`, `InventMovement`, `LedgerVoucher`, posting-specific classes |
| **Form XPO** | `FORM #`, `DATASOURCE`, `SOURCE #init`, `SOURCE #active`, form method structure |
| **Class** | `CLASS #`, `extends`, `new()`, `run()`, `construct()`, `main()` |
| **Method / function** | Single method body, no class wrapper visible |
| **Table code** | `TABLE #`, `modifiedField`, `validateWrite`, `initValue`, `find`, `exist` |

If the artifact matches multiple types (e.g., a posting class), use the posting sequence.

## Step 2 — Apply the Skill Sequence

| Artifact type | Skill sequence (in order) |
|--------------|--------------------------|
| Stack trace / profiler | `xppai-stack` → `xppai-codefix` |
| Posting code | `xppai-explain` → `xppai-posting` → `xppai-risk` → `xppai-codefix` |
| Form XPO | `xppai-explain` → `xppai-architect` → `xppai-risk` |
| Class | `xppai-explain` → `xppai-architect` → `xppai-risk` → `xppai-codefix` |
| Method / function | `xppai-explain` → `xppai-risk` → `xppai-codefix` |
| Table code | `xppai-explain` → `xppai-risk` |

## Step 3 — Produce Labeled Output

For each skill applied, output a clearly labeled section using the skill's own output format.

```
## [ARTIFACT TYPE DETECTED: <type>]
## [SKILLS APPLIED: skill1 → skill2 → ...]

---
## xppai-explain
<full explain output>

---
## xppai-risk
<full risk output>

---
## xppai-codefix
<full codefix output>
```

Do not blend outputs. Each section is self-contained and follows its skill's format exactly.

## Mandatory Final Review Gate

Before emitting final output, run `xppai-review`.

- If result is `PASS`: return output.
- If result is `FAIL`: revise once, re-run `xppai-review`, then:
  - pass -> return revised output
  - fail -> stop and report failed checks only

Never finalize output if review fails on localization edits (`LOC-1`) or tag checks (`TAG-1`, `TAG-2`, `TAG-3`).

## Export Integration

After analyzing an artifact, if the user asks to export related objects to XPO files, invoke `xppai-exportxpo` with the object list. This generates a ready-to-paste X++ export job.

## Report Integration

After analysis, if the user requests a documentable output, invoke `xppai-report` using one of:

- `change-report`
- `session-resume`
- `technical-report`

## Rules

- Always state the detected artifact type before starting
- Always state the skill sequence being applied
- Apply each skill fully — do not summarize or truncate
- If the artifact is ambiguous, state which type was chosen and why
- If context is clearly insufficient for a skill (e.g., no fix is possible without more code), state that explicitly in that section rather than skipping it silently
