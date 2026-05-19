---
name: xppai-posting
description: Use when analyzing AX 2009 posting flows, document generation, FormLetter classes, journal creation, or any transactional framework behavior involving SalesFormLetter, PurchFormLetter, totals, tax, inventory, or ledger posting.
---

# XppAI Posting

**Required background:** `xppai-core` + `xppai-domain`  
**XPO input:** run `xppai-intake` once

Use canonical evidence labels: `Confirmed | Likely | Hypothesis | Unknown`.

## Pre-condition Gate

Require posting-class code or FormLetter-related evidence. If not provided, stop and request the relevant posting artifact before analysis.

## Output

1. Executive Summary
2. Posting Scenario
3. Entry Point and Main Framework Path
4. Standard Framework Behavior in Play
5. Customization Behavior Found
6. Key Side Effects and Generated Artifacts
7. Fragile or High-Risk Areas
8. What to Inspect Next
9. Safe-Change Notes

## Adaptive Depth

Omit sections that would be empty, `N/A`, or filler.
