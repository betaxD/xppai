---
name: xppai-ax2012-core
description: Mandatory evidence and safety rules for Microsoft Dynamics AX 2012 R3 analysis and implementation guidance
---

# xppAI AX 2012 R3 Core

Use this skill as the mandatory foundation for every `xppai-ax2012` request. Use only for Microsoft Dynamics AX 2012 R3. Never use AX 2009 or D365 implementation rules as substitutes. Do not use Chain of Command, D365 extension classes, or another product baseline as implementation guidance.

## Lean execution

Return the useful result first and include only relevant detail. Keep routing, reference selection, evidence bookkeeping, and passed gates internal unless they affect the answer or the user asks for them. Ask only for information that blocks the next safe action; otherwise proceed with bounded assumptions and mark unsupported facts `Unknown`.

Work in the existing user-selected location. Do not create directories, documentation, plans, reports, checklists, or other durable artifacts unless the user explicitly requests them or they are the requested implementation artifact. Skip empty sections and do not restate the request. These presentation rules do not weaken any safety or evidence gate below.

## Product boundary

- Treat `xppai-ax2012` as an independent product, asset tree, cache, and release lifecycle.
- Do not import implementation guidance from another xppAI package or from an unversioned skill.
- Reference packs are not loaded by default. Resolve only relevant packs through the canonical manifest: `../../references/manifest.json` from this source-tree skill directory, or `../xppai-ax2012-references/manifest.json` from an installed or exported skill directory. Do not create private or mirrored reference trees.
- Production-ready guidance is permitted only for supported domains or gated domains whose evidence requirements pass. Deferred domains receive preliminary analysis and an explicit gap report only.

## Evidence hierarchy

Label material conclusions as `Confirmed`, `Likely`, `Hypothesis`, or `Unknown`.

- `Confirmed`: directly established by supplied source, XPO, model-store metadata, xRef, build information, or reproducible output.
- `Likely`: strongly supported by several observations but not directly proven.
- `Hypothesis`: a bounded explanation to test, never a fact or root-cause claim.
- `Unknown`: evidence is absent, conflicting, incomplete, or outside the parser/reference capability.

Treat model, layer, application build, kernel build, CU/hotfix state, effective top-layer implementation, xRef/callers, overrides, delegates, pre/post handlers, external subscribers, partition, company, effective identity, execution host, transaction scope, and deployment artifacts as `Unknown` unless evidence proves them. AX 2012 R3 alone does not prove one exact runtime state.

## Cross-cutting AX 2012 rules

- Keep local variable declarations at the beginning of X++ methods.
- Preserve `ttsLevel`, `forUpdate`, transaction, exception, and aggregate-result semantics.
- Use the correct `TextIo.status()` pattern.
- Treat AOT and MorphX as active development concepts.
- Classify each relevant entry point by host, execution engine, identity, partition, company, security boundary, transaction scope, and deployment artifact.
- Generate X++ for the current company. Do not generate `changeCompany` or `crossCompany` unless the user explicitly requests cross-company behavior; a company field in supplied code or metadata is not an explicit request.
- Treat AX32 client execution as p-code and batch/service execution as CIL; `Server` alone does not prove CIL execution.
- Require batch/service-reachable paths to compile and be tested in CIL and in their real execution mode.
- Prefer the smallest behavior-preserving change.
- Protect country/region behavior and require explicit regional scope plus configuration-key and metadata evidence.
- Require both layer and model context before production-ready change guidance.
- State compile, database synchronization, CIL generation, deployment, and AOS implications when applicable.

When evidence cannot support a safe conclusion, stop at `Unknown` and name the next required evidence.
