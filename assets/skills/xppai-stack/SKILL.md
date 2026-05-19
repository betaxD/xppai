---
name: xppai-stack
description: Use when analyzing X++ AX 2009 profiler traces, code stack traces, or execution paths to identify performance bottlenecks — repeated call chains, quadratic loops, expensive constructor+calc combos, excessive tax/totals recalculation, or deep framework cascades.
---

# XppAI Stack

**Required background:** `xppai-core` + `xppai-domain`  
**XPO input:** run `xppai-intake` once

Use canonical evidence labels: `Confirmed | Likely | Hypothesis | Unknown`.

## Pre-condition Gate

Require profiler output or stack trace evidence. If only plain description is provided, stop and request trace/profiler data before analysis.

## Output

1. Executive Summary
2. Dominant Call Path
3. Top Bottlenecks
4. Why Expensive in AX 2009 Terms
5. Most Likely Root Cause
6. Critical Objects for Specialist Review
   Every distinct AOT object (class, table, form, map) that appears in the dominant
   call path. For each: exact name, type, role in the chain (loop driver / called per
   iteration / provides data / triggers cascade), and what a specialist should look for.
   Omit kernel framework objects (SysSetupFormRun, Info, etc.) unless they are the
   actual cost driver. When the path spans multiple objects, do not collapse it to a
   single frame.
7. Recommended Next Investigation or Fix

## Mode: brief

Return only:
1. Executive Summary
2. Top Bottlenecks
3. Most Likely Root Cause

## Adaptive Depth

Omit sections that would be empty, `N/A`, or filler.
