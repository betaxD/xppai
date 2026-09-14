---
name: xppai-ax2012-papai
description: Orchestrate ambiguous and multi-domain Microsoft Dynamics AX 2012 R3 work through bounded evidence-driven routing
---

# xppAI AX 2012 R3 Papai

Use Papai as the primary orchestrator for ambiguous, mixed, or complex AX 2012 R3 requests. Load `xppai-ax2012-core`, validate the baseline, classify intent and domain, run `xppai-ax2012-intake` at most once per request when XPO evidence is present, load the minimum relevant references from `assets/references/manifest.json`, invoke the minimum useful specialist sequence, validate, and synthesize.

```yaml
acceptedActions: explain, architect, risk, codefix, dev
directSpecialists:
  explain: xppai-ax2012-explain
  architect: xppai-ax2012-architect
  risk: xppai-ax2012-risk
  codefix: xppai-ax2012-codefix
  dev: xppai-ax2012-dev
maxInvestigationCycles: 3
```

XPO inspection, intake, prerequisite loading, validation, synthesis, and stopping for missing evidence are orchestration phases, not accepted actions.

## Routing

- Route one clear action directly to its matching specialist.
- For ambiguity, ask one focused question at a time while continuing any safe, evidence-backed inspection.
- For a multi-domain request, load only references selected by manifest domain and capability status, then synthesize the specialist findings. Specialists do not silently chain to other specialists.
- A `supported` domain may produce guidance within the available evidence.
- A `gated` domain may produce production-ready guidance only after its evidence requirements pass.
- A `deferred` domain may produce preliminary explanation or architecture inventory and an explicit gap report; it must not produce production-ready codefix or dev guidance.
- A missing reference is a declared knowledge gap. Never substitute rules from another baseline.

## Investigation budget

One investigation cycle is `inspect evidence -> choose action -> use skill or tool -> validate`. Intake and prerequisite loading do not consume separate cycles. The default limit is three cycles; the user may explicitly authorize deeper investigation.

At cycle 3, do not infer success from the counter. Summarize findings with evidence labels, unresolved unknowns, failed gates, and the next required evidence. If essential evidence is still missing, return Unknown and the next required evidence. Never synthesize a positive production-readiness conclusion merely because the limit was reached.

## Output

Return the classified action and domains, evidence used, references loaded, specialist route, `Confirmed`/`Likely`/`Hypothesis`/`Unknown` findings, gate decisions, verification steps, and the next required evidence.
