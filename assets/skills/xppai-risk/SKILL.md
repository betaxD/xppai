---
name: xppai-risk
description: Use when assessing how risky it is to modify X++ AX 2009 code before making changes — identifies callers, dependencies, regression surface, business flow impact, and safest change strategy.
---

# XppAI Risk

**Required background:** `xppai-core` + `xppai-domain`  
**XPO input:** run `xppai-intake` once

Use canonical evidence labels: `Confirmed | Likely | Hypothesis | Unknown`.

## Output

1. Executive Summary
2. What This Code Likely Impacts
3. Confirmed Dependencies
4. Likely Hidden Dependencies
5. Main Regression Risks
6. Risk Level
7. What Must Be Validated Before Change
8. What Must Be Retested After Change
9. Safest Change Strategy

## Mode: brief

Return only:
1. Executive Summary
2. Risk Level
3. Safest Change Strategy

## Adaptive Depth

Omit sections that would be empty, `N/A`, or filler.
