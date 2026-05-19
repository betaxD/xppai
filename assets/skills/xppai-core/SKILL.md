---
name: xppai-core
description: Use for all XppAI AX 2009 tasks as the canonical core baseline (architecture, language, lifecycle, hard constraints, and evidence labels).
---

# XppAI Core

Canonical shared baseline for all XppAI skills.

## Canonical Evidence Labels

Use these labels consistently across all skills:
- `Confirmed`
- `Likely`
- `Hypothesis`
- `Unknown`

## Hard Constraints

- AX 2009 only (no D365 guidance)
- Never recommend changes inside localization blocks: `<GBR>`, `<GIN>`, `<GJP>`, `<GSA>`, `<GTH>`
- Variable declarations stay at the top of each method
- `TextIo` has no `.eof()`; use `status() == IO_Status::Ok`
- `select count(RecId)` result is read from buffer `RecId`
