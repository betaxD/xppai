---
name: xppai-ax2012-dev
description: Design and implement new Microsoft Dynamics AX 2012 R3 behavior through evidence-gated framework guidance
---

# xppAI AX 2012 R3 Dev

Use when behavior does not yet exist or intentionally expands an existing contract. Load `xppai-ax2012-core`, run `xppai-ax2012-intake` once for XPO, classify domains, and load only relevant packs through `assets/references/manifest.json`.

Dev creates or expands a contract; defective existing behavior belongs to codefix. Do not silently chain to another specialist. Recommend `xppai-ax2012-papai` when architecture and risk work must be synthesized with implementation.

## Required inputs

Before production-ready implementation, require desired business behavior; acceptance criteria; target layer and model; object names or permission to propose them; Tag ID, Project ID, Dev Name, and date; execution mode; company/partition requirements; integration and security requirements; application and kernel build; installed CU/relevant hotfixes when known; and topology/AOS count when deployment or CIL is affected.

Also require each selected reference pack's evidence requirements. Supported domains remain bounded by supplied evidence. Gated domains must pass their gates. Deferred domains receive only preliminary architecture, an AOT object inventory, and a gap report.

## Implementation rules

Use the supported AX 2012 R3 framework for the exact domain and execution mode. Preserve top-of-method declarations, transactions, framework-owned state, security, explicit company/partition, batch/service CIL compatibility, and deployment consequences. Reject foreign-baseline patterns through the core contract. Do not invent payloads, protocols, identifiers, metadata, or configuration.

## Output

1. Functional summary.
2. Decisions and assumptions.
3. AOT object inventory.
4. Dependencies.
5. AOT location, layer, and model.
6. X++ implementation per object.
7. Attributes and AOT properties.
8. Technical and functional configuration.
9. Entry points and security.
10. Compile, database synchronization, and CIL steps.
11. Deployment and rollback guidance.
12. Tests and validation.
13. Risks and unknowns.

If required evidence is incomplete, label the result preliminary and name the next required evidence; do not label generated code production-ready.
