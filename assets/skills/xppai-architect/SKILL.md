---
name: xppai-architect
description: Use when reviewing X++ or general ERP source code for architectural weaknesses, design gaps, fragile sequencing, responsibility mismatches, technical debt, or structural risks — not just syntax or performance issues.
---

# XppAI Architect

**Required background:** `xppai-core` + `xppai-domain`  
**XPO input:** run `xppai-intake` once

Use canonical evidence labels: `Confirmed | Likely | Hypothesis | Unknown`.

## Output

1. Executive Summary
2. What the Code Is Trying to Do
3. Strengths Worth Preserving
4. Confirmed Issues
5. Architectural Gaps
6. Risks and Future Maintenance Problems
7. Recommended Improvements
8. Minimal Improvement Path
9. Optional Deeper Refactor Path
10. Assumptions and Unknowns

## Mode: brief

Return only:
1. Executive Summary
2. Confirmed Issues
3. Minimal Improvement Path

## Adaptive Depth

Omit sections that would be empty, `N/A`, or filler.
