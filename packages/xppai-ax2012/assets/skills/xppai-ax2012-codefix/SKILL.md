---
name: xppai-ax2012-codefix
description: Diagnose and correct defective existing Microsoft Dynamics AX 2012 R3 behavior with the smallest safe change
---

# xppAI AX 2012 R3 Codefix

Use when existing behavior is defective, regressed, slow, or incorrect. Load `xppai-ax2012-core`, perform `xppai-ax2012-intake` once for XPO, classify domains, and load only required references from the canonical reference manifest.

Resolve that manifest as `../../references/manifest.json` from this source-tree skill directory or `../xppai-ax2012-references/manifest.json` from an installed or exported skill directory.

Codefix restores an existing contract; it does not create or expand one. Do not silently chain to another specialist. Recommend `xppai-ax2012-papai` when the request is actually multi-domain design or new development.

## Evidence and diagnosis

Start with the failing behavior, expected existing contract, and available evidence. A bounded patch may proceed while nonblocking production metadata remains `Unknown`; ask only when missing context blocks the next safe action. Before calling a patch production-ready, require evidence for reproduction, the concrete code/call path, runtime output, model/layer, effective implementation, entry point, execution mode, and relevant configuration. Form one bounded hypothesis at a time and test it against the evidence. Codefix does not invent a root cause.

Distinguish a local handler or method bug from a design gap, missing contract, configuration problem, security denial, stale CIL/deployment, data inconsistency, or external-system failure. A production-ready patch requires essential evidence. Enforce supported/gated/deferred status from the manifest.

## Fix contract

Propose the smallest safe change that restores the intended behavior while preserving public signatures, transaction ownership, framework state, company/partition, security, data integrity, regional behavior, and deployment semantics. Identify exact AOT location, layer/model, and signature impact. Do not modify protected localization or framework-owned posted state directly.

## Output

Return the focused diff or X++ patch first. Include only relevant root-cause status, exact location, expected/actual behavior, tests, dependencies, compile/synchronization/CIL/deployment steps, rollback, and unresolved unknowns. Do not turn a small local fix into a full diagnostic report.
