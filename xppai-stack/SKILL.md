---
name: xppai-stack
description: Use when analyzing X++ AX 2009 profiler traces, code stack traces, or execution paths to identify performance bottlenecks — repeated call chains, quadratic loops, expensive constructor+calc combos, excessive tax/totals recalculation, or deep framework cascades.
---

# XppAI Stack — X++ AX 2009 Stack Trace & Profiler Analysis

**REQUIRED BACKGROUND:** Load `xppai-init` before applying this skill.

## Overview

Specialist technique for reading AX 2009 X++ profiler outputs and code execution stack traces, identifying the dominant call path, and ranking bottlenecks by actual impact — not generic advice.

## Focus Areas

- Repeated call chains in the same execution pass
- Duplicated passes over the same data set
- Quadratic or near-quadratic loops (O(n²) method call nesting)
- Expensive constructor + `calc()` combinations called per line
- Excessive totals/tax recalculation (`calcTax`, `TaxCalculat*`, `SalesParmLine`)
- Deep cascades triggered by seemingly small actions (e.g., field update → totals → tax → currency)
- Hidden hot paths behind framework calls (`SalesFormLetter`, `AxSalesLine`, `FormDataSource.refresh`)

## Rules

- Be specific to X++ and AX 2009 behavior — no generic advice
- Do not invent code not present in the evidence
- Prioritize the dominant path shown by profiler call count and cumulative duration
- Distinguish explicitly: **Evidence** (seen in trace) | **Hypothesis** (inferred) | **Recommendation** (next step)
- Prefer practical explanations over academic ones

## Output Format

Always produce output in this exact structure:

```
1. Executive Summary
   One paragraph: what is slow, why, and where.

2. Dominant Call Path
   The heaviest call chain top-to-bottom, with call counts if available.

3. Top Bottlenecks (ranked by impact)
   | Rank | Method/Location | Evidence | Cost Type |
   Each entry: method name, call count, duration share, cost type.

4. Why This Is Expensive in AX 2009 Terms
   AX 2009-specific explanation: kernel dispatch overhead, form buffer
   re-evaluation, SysOperation framework cost, X++ interpreter overhead, etc.

5. Most Likely Root Cause
   Single most probable structural cause (e.g., "calc() called per line
   inside a loop that iterates all SalesParmLine records").

6. Recommended Next Investigation or Fix
   Concrete: what to instrument, what to cache, what to move outside the loop.
```

## Key Call-Out Pattern

When possible, explicitly identify:

- **First avoidable expensive pass**: where does the first redundant traversal begin?
- **Second redundant pass**: where does it repeat unnecessarily?
- **Cost level**: is this line-level, total-level, or UI-triggered?

## Cost Type Reference

| Cost Type | Description |
|-----------|-------------|
| Line-level | Cost scales with number of order/journal lines in the loop |
| Total-level | Recalculation of order/invoice totals (tax, currency, discount) |
| UI-triggered | Driven by form refresh, datasource reread, or display method re-execution |
| Constructor | `new Object(...)` instantiation per iteration inside a loop |
| Interpreter | X++ method dispatch overhead accumulated across many shallow calls |

## Common AX 2009 Hot Paths

```
SalesFormLetter → SalesParmLine (per-line loop)
  → TaxCalculat::newTrans()        [constructor per line]
    → Tax::calc()                  [full recalc per line]
      → ExchRate lookup            [if multi-currency order]

FormDataSource.refresh() inside update()
  → executeQuery() re-runs
    → display methods recalc for all visible rows

AxSalesLine.modifiedField()
  → SalesLine.initFromSalesTable() [re-fetches parent record]
    → SalesTable.find()            [no cache, re-read from buffer]
```

## Common Mistakes

| Mistake | What to do instead |
|---------|--------------------|
| Assuming slow = data volume | Check call count first — constructor overhead often dominates |
| Blaming the deepest frame | Root cause is the loop that calls it, not the method itself |
| Treating UI refresh as free | `FormDataSource.refresh()` re-executes all display methods for all rows |
| Missing tax cascade | Tax recalc triggers currency, discount, and totals — one field change = 4+ passes |
| Ignoring shallow call count | 100k calls to a 1ms method = 100s; profiler duration alone misleads |
