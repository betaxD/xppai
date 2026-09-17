---
name: xppai-ax2012-help
description: Catalog the Microsoft Dynamics AX 2012 R3 skills, references, CLI commands, and safe routing boundaries
---

# xppAI AX 2012 R3 Help

Use this skill to select the right `xppai-ax2012` entry point without performing the requested technical work.

## Ten public skills

- `xppai-ax2012-core`: mandatory baseline and evidence rules.
- `xppai-ax2012-intake`: one-time evidence and XPO intake.
- `xppai-ax2012-papai`: ambiguous, mixed, or multi-domain orchestration.
- `xppai-ax2012-explain`: explain existing artifacts and behavior.
- `xppai-ax2012-architect`: review or design boundaries and interactions.
- `xppai-ax2012-risk`: score change, regression, and deployment risk.
- `xppai-ax2012-codefix`: restore defective existing behavior.
- `xppai-ax2012-dev`: create or expand behavior and artifacts.
- `xppai-ax2012-ririchard`: review AX 2012 R3 XPOs only against the approved Ririchard/Frigelar compliance catalog.
- `xppai-ax2012-help`: show this catalog.

The twelve reference packs are internal domain knowledge selected through the canonical manifest: `../../references/manifest.json` from this source-tree skill directory, or `../xppai-ax2012-references/manifest.json` from an installed or exported skill directory. Users invoke skills, not references. Production-ready guidance remains limited by each reference's supported, gated, or deferred status and available evidence.

Use the CLI for asset listing/path, transactional install/export, or byte-preserving XPO cache operations. See the package README and `docs/` for exact commands, target layouts, cache identity, and release gates.

If supplied evidence conflicts with Microsoft Dynamics AX 2012 R3, report the baseline conflict and stop instead of routing to another product's rules.
