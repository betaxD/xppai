---
name: xppai-ax2012-dev
description: Design and implement new Microsoft Dynamics AX 2012 R3 behavior through evidence-gated framework guidance
---

# xppAI AX 2012 R3 Dev

Use when behavior does not yet exist or intentionally expands an existing contract. Load `xppai-ax2012-core`, run `xppai-ax2012-intake` once for XPO, classify domains, and load only relevant packs through the canonical reference manifest.

Resolve that manifest as `../../references/manifest.json` from this source-tree skill directory or `../xppai-ax2012-references/manifest.json` from an installed or exported skill directory.

Dev creates or expands a contract; defective existing behavior belongs to codefix. Do not silently chain to another specialist. Recommend `xppai-ax2012-papai` when architecture and risk work must be synthesized with implementation.

## Required inputs

Before production-ready implementation, require desired business behavior; acceptance criteria; target layer and model; object names or permission to propose them; Tag ID, Project ID, Dev Name, and date; execution mode; company/partition requirements; integration and security requirements; application and kernel build; installed CU/relevant hotfixes when known; and topology/AOS count when deployment or CIL is affected.

Also require each selected reference pack's evidence requirements. Supported domains remain bounded by supplied evidence. Gated domains must pass their gates. Deferred domains receive only preliminary architecture, an AOT object inventory, and a gap report.

Collect these inputs only when they are relevant to the requested artifact. Missing production metadata does not block a bounded draft or local implementation step; keep it `Unknown` and ask only when it blocks the next safe action.

## Implementation rules

Use the supported AX 2012 R3 framework for the exact domain and execution mode. Generate X++ for the current company. Do not generate `changeCompany` or `crossCompany` unless the user explicitly requests cross-company behavior. Preserve top-of-method declarations, transactions, framework-owned state, security, company/partition context, batch/service CIL compatibility, and deployment consequences. Reject foreign-baseline patterns through the core contract. Do not invent payloads, protocols, identifiers, metadata, or configuration.

Use Portuguese for labels and user-facing texts. Use English for AOT object names and code identifiers, following Dynamics AX conventions; never add an `xpp` prefix to a custom object name. Existing localization blocks have priority over the proposed solution and require explicit prior authorization before any modification. Surface the impact and obtain agreement during design/planning/analysis/proposal before implementation. Keep the implementation minimal: every class, `changeCompany`, `try/catch`, and other abstraction must have a concrete requirement and a clear responsibility.

## Output

Return the implementation first. Include only relevant assumptions, AOT object inventory and location, dependencies, properties or configuration, entry points and security, compile/database synchronization/CIL steps, deployment or rollback, tests, risks, and unknowns. Do not emit empty headings or a fixed multi-section report.

If required evidence is incomplete, label only the affected conclusion preliminary and name the blocking evidence; do not label generated code production-ready.
