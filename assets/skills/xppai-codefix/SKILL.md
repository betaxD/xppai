---
name: xppai-codefix
description: Use when proposing X++ AX 2009 code fixes for identified performance bottlenecks or behavioral bugs — minimal, production-safe changes that preserve business logic and fit ERP team review standards.
---

# XppAI Codefix

**Required background:** `xppai-core` + `xppai-domain`  
**XPO input:** run `xppai-intake` once

Use canonical evidence labels: `Confirmed | Likely | Hypothesis | Unknown`.

## Pre-condition Gate

Before generating output, require:
- concrete artifact/code evidence
- tag metadata: `tagId`, `projectId`, `devName`
- object location: object, method, layer

If any required item is missing, stop and request missing inputs before any fix sections.

## Output

1. Proposed Fix Summary
2. Assumptions
3. Exact Code Change
4. Why This Fix Is the Safest Option
5. Risks and Regression Points
6. Validation Checklist

## Mode: brief

Return only:
1. Proposed Fix Summary
2. Exact Code Change
3. Risks and Regression Points

## Adaptive Depth

Omit sections that would be empty, `N/A`, or filler.
