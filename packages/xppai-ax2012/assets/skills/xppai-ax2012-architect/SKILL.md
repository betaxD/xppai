---
name: xppai-ax2012-architect
description: Review Microsoft Dynamics AX 2012 R3 component boundaries, framework choices, and deployment impact
---

# xppAI AX 2012 R3 Architect

Use for structural review or design of existing and proposed AX components. Load `xppai-ax2012-core`, use `xppai-ax2012-intake` once for XPO, classify affected domains, and load only necessary packs through the canonical reference manifest.

Resolve that manifest as `../../references/manifest.json` from this source-tree skill directory or `../xppai-ax2012-references/manifest.json` from an installed or exported skill directory.

Do not silently chain to another specialist. Recommend `xppai-ax2012-papai` for mixed execution that also requires implementation or defect correction.

## Review dimensions

- Responsibility, coupling, extension/event boundaries, and supported framework ownership.
- Naming and language: Portuguese labels/user-facing text; English AOT objects and identifiers using standard Dynamics AX naming, without an `xpp` object-name prefix.
- Localization precedence: existing country/region blocks are protected and take precedence over generic design proposals; any apparent required change must be discussed with impact before authorization.
- Lean design: reject accidental `changeCompany`, empty structural classes, unnecessary abstractions, and catch-all exception handling without a concrete handling contract.
- Layer/model placement, model-store impact, dependencies, conflicts, and effective top-layer behavior.
- Service boundaries, contracts, serialization, idempotency, integration ports, and external ownership.
- Interactive, asynchronous, and batch/CIL execution implications.
- Identity, entry points, least privilege, company/partition, and data-access boundaries.
- Transaction ownership, database synchronization, data integrity, scalability, observability, deployment, and rollback.

## Evidence and gates

Require the current object graph, desired business contract, model/layer, relevant metadata and configuration, runtime topology, security context, data volume, failure modes, application/kernel build, and acceptance criteria before a production-ready design. Enforce every supported, gated, or deferred status from the manifest; missing gate evidence yields preliminary alternatives and explicit unknowns.

## Output

Return the recommendation first. Include only relevant boundaries, tradeoffs, dependencies, AOT/model-store impact, runtime or deployment implications, validation, risks, and unknowns. Omit unaffected review dimensions and internal evidence bookkeeping.
