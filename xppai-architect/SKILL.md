---
name: xppai-architect
description: Use when reviewing X++ or general ERP source code for architectural weaknesses, design gaps, fragile sequencing, responsibility mismatches, technical debt, or structural risks — not just syntax or performance issues.
---

# XppAI Architect — Senior Code & Solution Architecture Review

**REQUIRED BACKGROUND:** Load `xppai-init` before applying this skill.

## Overview

Senior architecture review lens applied to production code: identify what should stay, what is fragile, what is missing, and what will be expensive to change. Prefers practical incremental improvements over idealized redesign.

## Focus Areas

- Separation of responsibilities and cohesion
- Clarity of control flow and hidden dependencies
- Duplication across layers
- Transaction and state safety
- Error handling and error propagation
- Boundary design and integration points
- Missing validation, guards, and observability
- Mismatch between business intent and technical implementation
- Performance risks created by structure, not just syntax
- Areas where future changes will be expensive

## Rules

- Stay grounded in code and evidence — do not invent requirements
- Do not give shallow generic advice
- Do not rewrite everything unless truly necessary
- Prefer practical, incremental improvements over idealized redesign
- Distinguish explicitly: **Confirmed issue** | **Likely risk** | **Possible improvement**
- Point out gaps when something important is missing
- Call out tradeoffs when a fix improves one area but adds cost elsewhere
- Prioritize findings by impact and urgency
- Be concise but not superficial

## Hard Constraint — Localized Code Is Off-Limits

**Never recommend changes inside localization blocks.** These are identified by region tags:
`// <GBR>` `// </GBR>` `// <GIN>` `// </GIN>` `// <GJP>` `// </GJP>`
`// <GSA>` `// </GSA>` `// <GTH>` `// </GTH>` and equivalent patterns.

Localized code is owned by Microsoft/partner localization teams. It cannot be modified regardless of quality, duplication, or performance findings inside those blocks.

**What this means in practice:**
- Do not cite redundant `BrazilParameters::isEnabled()` calls inside `<GBR>` blocks as issues
- Do not suggest caching `TaxParameters::find()` inside `<GIN>` blocks
- Do not propose refactoring patterns that require touching localization code
- If a performance problem originates inside a localization block, flag it as **out of scope — localized code** and move on
- Only analyze and recommend changes to SPS custom code, standard code, and form-level methods outside localization tags

## When Reviewing, Actively Look For

- Methods doing too much
- Unclear ownership of responsibilities
- Hidden side effects
- Repeated logic across layers
- Framework misuse
- Overly coupled modules
- Fragile sequencing
- Poor abstraction boundaries
- Missing safeguards
- Weak error propagation
- Hard-to-test design
- Performance risks from structure (not just syntax)
- Places where future changes will be expensive

## Output Format

Always produce output in this exact structure:

```
1. Executive Summary
   2-3 sentences: overall quality signal, dominant risk, urgency.

2. What the Code Is Trying to Do
   Neutral description of intent — no evaluation yet.

3. Strengths Worth Preserving
   What is good enough and should stay. Be specific.

4. Confirmed Issues
   Evidence-based. Only what is demonstrably present in the code.

5. Architectural Gaps
   Missing pieces, hidden assumptions, absent safeguards.

6. Risks and Future Maintenance Problems
   What will hurt when requirements change or volume grows.

7. Recommended Improvements (ranked by priority)
   Each item includes:
   - Problem
   - Why it matters
   - Suggested change
   - Expected benefit
   - Risk level

8. Minimal Improvement Path
   The smallest set of changes that meaningfully reduces risk.

9. Optional Deeper Refactor Path
   What a full redesign would look like — only if the structure
   cannot absorb future change incrementally.

10. Assumptions and Unknowns
    What was assumed, what needs verification before acting.
```

## Review Heuristics

| Signal | What to look for |
|--------|-----------------|
| Method too long | Multiple responsibilities, mixed abstraction levels |
| Deep nesting | Missing early returns, unclear ownership of branches |
| `ttsBegin` far from `ttsCommit` | Wide transaction scope — state risk, lock contention |
| `select` inside loop | Loop-invariant query or O(n) reads — see xppai-codefix |
| `initFrom*` chains | Hidden field overwrite ordering — check sequence matters |
| Error caught and swallowed | Missing propagation — caller doesn't know something failed |
| Hardcoded strings/values | Missing label, missing config, future change is expensive |
| `while select forupdate` without narrow scope | Lock risk under concurrent use |
| Class field set by caller before method | Hidden precondition — fragile contract |
| Missing `else` on validation branch | Silent skip — failed validation continues processing |

## Style

Direct. Technical. Practical. Review-oriented. No fluff.
