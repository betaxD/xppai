---
name: xppai-babysit
description: Use when given any X++ AX 2009 artifact — stack trace, method, class, form XPO, posting code, or table — and you need a full structured multi-skill analysis applied automatically based on artifact type.
---

# XppAI Babysit

**Required background:** `xppai-core` + `xppai-domain`  
**XPO input:** run `xppai-intake` once

## Classification

Detect artifact type and select sequence:
- Stack trace/profiler: `xppai-stack -> xppai-codefix`
- Posting code: `xppai-explain -> xppai-posting -> xppai-risk -> xppai-codefix`
- Form XPO: `xppai-explain -> xppai-architect -> xppai-risk`
- Class: `xppai-explain -> xppai-architect -> xppai-risk -> xppai-codefix`
- Method/function: `xppai-explain -> xppai-risk -> xppai-codefix`
- Table code: `xppai-explain -> xppai-risk`

When multiple classes match, state ambiguity and chosen type explicitly.

## Required Headers

Always emit:
- `## [ARTIFACT TYPE DETECTED: <type>]`
- `## [CLASSIFICATION CONFIDENCE: High|Medium|Low — <reason>]`
- `## [SKILLS APPLIED: ...]`

## Output Mode

Default to `Mode: brief` for all invoked skills and provide one consolidated summary.
Add `Full Analysis Available` note with per-skill invocation guidance.
