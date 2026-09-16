---
name: xppai-ax2012-intake
description: Select and normalize evidence once for Microsoft Dynamics AX 2012 R3 requests
---

# xppAI AX 2012 R3 Intake

Load `xppai-ax2012-core` first. Intake accepts a local XPO file, pasted XPO, an explicit parser cache revision, a stack trace, requirements, a diff, or a plain-language description. Direct local-file intake is the preferred XPO evidence path; pasted XPO is analyzed directly; cache use is optional.

When downstream routing needs reference packs, resolve the canonical manifest as `../../references/manifest.json` from this source-tree skill directory or `../xppai-ax2012-references/manifest.json` from an installed or exported skill directory.

## One-time intake contract

Perform at most one XPO parse per request. If Papai or a specialist already supplied normalized parser output, reuse it and do not parse the same evidence again. Intake and reference loading do not consume an investigation cycle.

For XPO evidence:

1. Read the local file as bytes, or preserve the exact pasted bytes through the stdin path.
2. Use the same versioned parser for file and stdin input.
3. Pass forward encoding, BOM state, original-byte hash, byte/character/line offsets, object provenance, baseline evidence, and the exact `complete`, `incomplete`, or `indeterminate` state.
4. Keep declared and inferred baseline evidence separate. Invocation through this package sets an expected AX 2012 R3 baseline; it does not confirm an unprovable artifact.
5. Preserve unknown top-level fragments and structural uncertainty. Do not infer effective layers, model ownership, xRef, subscribers, or portable object identity from XPO alone.

## Intake gates

- If a local XPO path cannot be read, stop and request a corrected path or pasted content.
- If strong AX 2009 or D365 signals conflict with the requested baseline, stop before cache mutation and report the conflict.
- If an exact cache revision is supplied, preserve its revision ID, normalized source identity, original-byte hash, and active/explicit selection provenance.
- If layer, model, build, CU/hotfix, topology, or external contract evidence is absent, allow bounded analysis but keep those facts `Unknown` and block production-ready claims that depend on them.
- For non-XPO evidence, identify its source, scope, completeness, and conflicts before routing it.

Return one normalized evidence summary with confirmed facts, likely observations, hypotheses to test, unknowns, baseline conflicts, completeness, provenance, and the next evidence required by any failed gate.
