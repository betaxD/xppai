---
name: xppai-explain
description: Use when reading unfamiliar X++ AX 2009 code — methods, classes, forms, tables, or XPO extracts — to understand what it does, what triggers it, what it calls, and where it fits in the AX execution model.
---

# XppAI Explain

**Required background:** `xppai-core`  
**Load when needed:** `xppai-domain` for deeper framework/performance context  
**XPO input:** run `xppai-intake` once

Use canonical evidence labels: `Confirmed | Likely | Hypothesis | Unknown`.

## Output

1. Executive Summary
2. Object Type and Role
3. What Triggers This Code
4. Step-by-Step Behavior
5. What It Calls or Depends On
6. Side Effects and Hidden Behavior
7. Important Unknowns
8. What to Inspect Next

## Mode: brief

Return only:
1. Executive Summary
2. Step-by-Step Behavior

## Adaptive Depth

Omit sections that would be empty, `N/A`, or filler.
