---
name: xppai-papai
description: Use when given any X++ AX 2009 artifact and you need an intelligent senior-engineer analysis — reads the artifact, reasons about what matters most, dynamically selects which skills to apply and in what order, and synthesizes findings into a practical assessment.
---

# XppAI Papai — Dynamic Senior Analysis (Agent + Skill)

Dual-mode orchestration:
- Agent mode: canonical implementation in `assets/agents/xppai-papai/AGENT.md`
- Skill mode: execute the same operating loop and routing rules in this file

**Required background:** `xppai-core` + `xppai-domain`  
**XPO input:** run `xppai-intake` once when present

## Operating Loop

1. Define goal
2. Inspect evidence
3. Choose next action
4. Apply selected skill/tool
5. Validate result
6. Stop or continue

Loop limits:
- Maximum 3 investigation cycles unless user explicitly asks for deeper analysis
- Stop early if the goal is already answered with high-confidence evidence

## Available Actions and Skill Routing

- `triage_support_issue` -> `xppai-support`
- `explain_artifact` -> `xppai-explain`
- `analyze_stack_or_trace` -> `xppai-stack`
- `assess_change_risk` -> `xppai-risk`
- `analyze_posting_flow` -> `xppai-posting`
- `review_architecture` -> `xppai-architect`
- `propose_codefix` -> `xppai-codefix`
- `prepare_xpo_export` -> `xppai-exportxpo`

Routing rule:
- If the request starts as a business/support symptom without sufficient artifact evidence, route first to `xppai-support`.

## Skill Selection Policy

- Choose the minimum useful sequence; do not apply skills that add no value.
- Prefer brief outputs when possible, then expand only when needed.
- Use canonical evidence labels: `Confirmed | Likely | Hypothesis | Unknown`.

## XPO Intake and Evidence Gate

- If XPO input exists (file path or pasted XPO object text), run `xppai-intake` once.
- Use direct local file or pasted text evidence first.
- Fallback inspection allowed only when:
  - local file access fails, or
  - required evidence detail is missing
- When fallback is used, include:
  - `Path used: fallback`
  - `Fallback reason: <file access failure|missing detail> - <concrete detail>`
- Otherwise include:
  - `Path used: direct-file`

## Validation Rules

- AX 2009 only
- No localization-block modifications (`<GBR>`, `<GIN>`, `<GJP>`, `<GSA>`, `<GTH>`)
- Preserve top-of-method variable declaration convention
- For codefix, require tag metadata + object location + layer + signature change flag before proposing fix code

## Stop Conditions

- User goal is answered
- Next step would add noise only
- Required context is missing and further analysis would be speculative
- 3 cycles reached without explicit user request to continue

For full canonical mission/action language and long-form guardrails, align with `assets/agents/xppai-papai/AGENT.md`.
