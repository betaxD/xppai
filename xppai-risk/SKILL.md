---
name: xppai-risk
description: Use when assessing how risky it is to modify X++ AX 2009 code before making changes — identifies callers, dependencies, regression surface, business flow impact, and safest change strategy.
---

# XppAI Risk — AX 2009 Pre-Change Impact Assessment

**REQUIRED BACKGROUND:** Load `xppai-init` before applying this skill.

## Overview

Pre-change risk assessment for AX 2009 code. Helps a developer decide what depends on this code, what could break, and how to change it safely — before touching anything.

## Rules

- Stay grounded in the provided code and known AX patterns
- Do not pretend to know the full call graph when context is incomplete
- Distinguish: **Confirmed dependency** | **Likely dependency** | **Possible dependency**
- Prefer realistic risk assessment — not fear-driven overstatement
- Do not recommend broad redesign when a targeted caution is enough
- Be explicit when more evidence is needed to raise confidence

## When Assessing, Actively Identify

- Where the code is likely called from (hot path or isolated)
- Whether it sits in a form, datasource, table, or class
- Whether it affects posting, totals, taxes, inventory, ledger, validations, or document status
- Whether it may be reused in places not obvious from local context
- Whether performance, integrity, or behavior could change indirectly
- Whether it is called from batch, UI, or integration contexts

## Output Format

Always produce output in this exact structure:

```
1. Executive Summary
   Is this safe to change? What is the dominant risk? How urgent is caution?

2. What This Code Likely Impacts
   Business flows, documents, UI behavior, or data that depends on this code.

3. Confirmed Dependencies
   Evidence-based: what is explicitly called, read, or written in the provided code.

4. Likely Hidden Dependencies
   Inferred from AX patterns: framework calls, lifecycle triggers, downstream cascades.

5. Main Regression Risks
   For each major risk:
   - Risk
   - Why it matters
   - How likely it is
   - How to reduce it

6. Risk Level
   LOW / MEDIUM / HIGH — with one-sentence justification.

7. What Must Be Validated Before Change
   What to check, read, or confirm before writing any code.

8. What Must Be Retested After Change
   Specific scenarios, documents, or flows to test.

9. Safest Change Strategy
   How to make the change with minimum blast radius.
   Include: what to preserve, what to guard, what order to apply changes.
```

## Risk Multipliers in AX 2009

| Factor | Why it raises risk |
|--------|-------------------|
| Method in `active()` or `modifiedField()` | Called constantly — side effects multiply |
| Method used in both UI and batch context | Change must be safe in both execution environments |
| Affects `PurchLine` / `SalesLine` / `InventTrans` | Core transactional tables — wide downstream impact |
| Inside `FormLetter` posting chain | Framework sequence is fragile — wrong override breaks posting |
| Called from `validateWrite` | Blocks all saves if behavior changes unexpectedly |
| Calls `calcTax()` or `PurchTotals.calc()` | Total recalculation cascades — correctness and performance risk |
| No clear single caller | Reuse is hidden — unknown regression surface |
| Old SPS customization with no comments | Intent is unclear — behavior may be non-obvious |
| `ttsBegin` scope spans the method | Transaction boundary change = potential data integrity issue |

## Risk Level Reference

| Level | Meaning |
|-------|---------|
| **LOW** | Isolated method, single known caller, no framework interaction, easy to retest |
| **MEDIUM** | Multiple callers likely, touches shared data or UI state, moderate retest surface |
| **HIGH** | Hot path, framework interaction, affects posting/totals/tax/inventory, or wide unknown reuse |

## Style

Direct. Technical. Cautious but practical. Review-oriented. No fluff.
