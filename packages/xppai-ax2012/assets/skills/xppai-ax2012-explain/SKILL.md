---
name: xppai-ax2012-explain
description: Explain existing Microsoft Dynamics AX 2012 R3 artifacts and framework behavior from supplied evidence
---

# xppAI AX 2012 R3 Explain

Use for understanding existing methods, classes, services, forms, tables, queries, configuration, or execution paths. Load `xppai-ax2012-core`; run `xppai-ax2012-intake` once when XPO evidence is present; classify the domain; and load only the minimum references selected through the canonical reference manifest.

Resolve that manifest as `../../references/manifest.json` from this source-tree skill directory or `../xppai-ax2012-references/manifest.json` from an installed or exported skill directory.

Do not silently chain to another specialist. Recommend `xppai-ax2012-papai` when the request crosses explanation into architecture, risk assessment, defect correction, or new implementation.

## Evidence and gates

Explain only what supplied code, parser output, metadata, stack traces, configuration, or runtime output supports. When parsed XPO is available, cite stable object identity plus byte and line references and carry completeness/provenance forward. Keep model, layer, effective implementation, callers, handlers, subscriber facts, build, and runtime context `Unknown` unless proven.

The explanation may describe a supported domain. For a gated domain, clearly separate preliminary explanation from any production-ready implication and name the evidence requirements. For a deferred domain, return preliminary architecture inventory and a gap report only.

## Output

1. Purpose and observed behavior.
2. Evidence map with `Confirmed`, `Likely`, `Hypothesis`, and `Unknown` labels.
3. Object and call-flow explanation.
4. Relevant framework/reference behavior.
5. Execution, security, transaction, company/partition, CIL, and deployment context.
6. Unknowns, conflicts, and the next evidence required.

Do not invent omitted branches, metadata, configuration, root cause, or external contracts.
