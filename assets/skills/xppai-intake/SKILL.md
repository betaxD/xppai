---
name: xppai-intake
description: Use only when XPO input is present to run canonical intake once (detect XPO, choose direct evidence path, and set intake state).
---

# XppAI Intake

Canonical XPO intake policy. Run only when XPO input is present.

## Detection

Treat input as XPO when either is present:
- File path ending in `.xpo`
- Pasted object text with headers such as `CLASS #`, `TABLE #`, `FORM #`, `QUERY #`, `MAP #`, `VIEW #`, `JOB #`, `PROJECT #`

## Intake Rules

- If file path and pasted XPO are both present, prefer the explicit file path
- Open local `.xpo` directly and read only required object text
- If file access fails, stop and request corrected path or pasted content
- Run intake at most once per user request
- Pass state marker: `XPO intake already completed for this request`

## XPO Analysis Gate Markers

When fallback is required, include:
- `Path used: fallback`
- `Fallback reason: <file access failure|missing detail> - <concrete detail>`

Otherwise include:
- `Path used: direct-file`
